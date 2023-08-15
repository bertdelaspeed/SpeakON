import { View, Text, Image } from "react-native";
import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
// import { UserRef } from "../../firebase/config";
import { AuthenticatedUserContext } from "../../Context/AuthenticationContext";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { ActivityIndicator } from "react-native";
import { FlatList } from "react-native";
const userAvatar = require("../../assets/man.png");
import { SimpleLineIcons } from "@expo/vector-icons";
import { combineData } from "../Utils";
import ChatItem from "../Component/ChatItem";

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, userAvatarUrl, setUserAvatarUrl } = useContext(
    AuthenticatedUserContext
  );

  const username = user.email.split("@")[0];
  const [friends, setFriends] = useState([]);
  const [lastMessage, setLastMessage] = useState([]);
  const [friendAvatar, setFriendAvatar] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          {!userAvatarUrl ? (
            <Image source={userAvatar} className="h-12 w-12 rounded-full" />
          ) : (
            <Image
              source={{ uri: userAvatarUrl }}
              className="h-12 w-12 rounded-full"
            />
          )}
        </TouchableOpacity>
      ),
    });
  });

  const UserRef = collection(db, "Users");
  const ChatRef = collection(db, "Chats");
  const queryResult = query(UserRef, where("email", "==", user.email));

  useEffect(() => {
    if (!user) {
      console.log("User not found");
      return;
    }
    async function DocFinder(queryResult) {
      const querySnapshot = await getDocs(queryResult);
      querySnapshot.forEach((doc) => {
        const { profilePic } = doc.data();
        setUserAvatarUrl(profilePic);
      });
    }
    DocFinder(queryResult);
  }, []);

  useEffect(() => {
    if (!user) return;

    const FetchLoggedInUserFriend = async () => {
      setIsLoading(true);

      const queryResult1 = query(
        ChatRef,
        where("chatters", ">=", `${username}`),
        where("chatters", "<=", `${username}` + "\uf8ff")
      );
      const queryResult2 = query(
        ChatRef,
        where("chatters", "<=", `xx${username}`)
      );

      let friendsArray = [];

      const unsubscribe1 = onSnapshot(queryResult1, (querySnapshot) => {
        setIsLoading(false);
        querySnapshot.forEach((document) => {
          if (document.data().chatters.includes(username)) {
            const chats = document.data().chatters;
            const friends = chats.replace(username, "").replace("xx", "");
            friendsArray.push(friends);

            friendsArray = [...new Set(friendsArray)];
            setFriends(friendsArray);
          }
        });
      });
      const unsubscribe2 = onSnapshot(queryResult2, (querySnapshot) => {
        setIsLoading(false);
        querySnapshot.forEach((document) => {
          if (document.data().chatters.includes(username)) {
            const chats = document.data().chatters;
            const friends = chats.replace(username, "").replace("xx", "");
            friendsArray.push(friends);

            friendsArray = [...new Set(friendsArray)];
            setFriends(friendsArray);
          }
        });
      });
      return () => {
        unsubscribe1();
        unsubscribe2();
      };
    };

    FetchLoggedInUserFriend();
  }, []);
  // console.log("liste des amis = ", JSON.stringify(friends));

  useEffect(() => {
    if (!user) {
      console.log("Aucun utilisateur");
      return;
    }

    let avatarArray = [];
    let latestMessage = [];

    const unsubscribe = friends.map((friend) => {
      const queryResult1 = query(UserRef, where("username", "==", friend));
      const unsubFriend = onSnapshot(queryResult1, (querySnapshot) => {
        querySnapshot.forEach((document) => {
          const { profilePic } = document.data();
          avatarArray.push({ name: friend, avatar: profilePic });
          setFriendAvatar([...avatarArray]);
        });
      });

      const queryResult2 = query(
        ChatRef,
        where("chatters", "==", `${username}xx${friend}`)
      );
      const queryResult3 = query(
        ChatRef,
        where("chatters", "==", `${friend}xx${username}`)
      );

      const unSubChat1 = onSnapshot(queryResult2, (querySnapshot) => {
        querySnapshot.forEach((document) => {
          conversation = document.data().conversation;
          let lastMessage = [];
          if (conversation && conversation.length > 0) {
            // lastMessage=[conversation.pop()]
            lastMessage = [conversation[conversation.length - 1]];
          }
          latestMessage.push({
            chatters: document.data().chatters,
            message: lastMessage,
          });
          setLastMessage([...latestMessage]);
        });
      });
      const unSubChat2 = onSnapshot(queryResult3, (querySnapshot) => {
        querySnapshot.forEach((document) => {
          conversation = document.data().conversation;
          let lastMessage = [];
          if (conversation && conversation.length > 0) {
            // lastMessage=[conversation.pop()]
            lastMessage = [conversation[conversation.length - 1]];
          }
          latestMessage.push({
            chatters: document.data().chatters,
            message: lastMessage,
          });
          setLastMessage([...latestMessage]);
        });
      });

      return () => {
        unsubFriend();
        unSubChat1();
        unSubChat2();
      };
    });

    return () => unsubscribe.forEach((unsub) => unsub());
  }, [friends]);

  const sortedLastMessage = lastMessage.sort();
  const combData = combineData(friendAvatar, sortedLastMessage);

  return (
    <>
      {isLoading ? (
        <View className="items-center justify-center h-full">
          <ActivityIndicator size="large" color="#d44A00" />
        </View>
      ) : (
        <FlatList
          data={combData}
          renderItem={({ item }) => (
            <ChatItem navigation={navigation} friend={item} />
          )}
        />
      )}

      <View className="flex flex-row-reverse absolute bottom-[10%] right-[7%]">
        <View>
          <TouchableOpacity
            onPress={() => navigation.navigate("Search")}
            className="bg-orange-500 h-16 w-16 rounded-full items-center justify-center"
          >
            <SimpleLineIcons name="magnifier" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default HomeScreen;
