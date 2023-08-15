import { View, Text, FlatList } from "react-native";
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "react-native";
import { TextInput } from "react-native";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { AuthenticatedUserContext } from "../../Context/AuthenticationContext";
import MessageItem from "../Component/MessageItem";
import axios from "axios";
const userAvatar = require("../../assets/man.png");

const ChatScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const { friendName, friendAvatar, friendEmail } = route.params;
  const { user } = useContext(AuthenticatedUserContext);
  const sender = user.email.split("@")[0];

  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const flatListRef = useRef(null);
  const chatRef = collection(db, "Chats");
  const queryResult1 = query(
    chatRef,
    where("chatters", "==", `${sender}xx${friendName}`)
  );
  const queryResult2 = query(
    chatRef,
    where("chatters", "==", `${friendName}xx${sender}`)
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View className="flex-row items-center space-x-2">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={30} color="orange" />
          </TouchableOpacity>
          {friendAvatar === undefined ? (
            <Image source={userAvatar} className="h-12 w-12 rounded-full" />
          ) : (
            <Image
              source={{ uri: friendAvatar }}
              className="h-12 w-12 rounded-full"
            />
          )}
          <Text className="text-lg tracking-widest text-gray-500">
            {friendName}
          </Text>
        </View>
      ),
    });
  });

  useEffect(() => {
    const fetchMessages = async () => {
      const querySnapshot1 = await getDocs(queryResult1);
      const querySnapshot2 = await getDocs(queryResult2);

      if (!querySnapshot1.empty || !querySnapshot2.empty) {
        let messages = querySnapshot1.docs.map(
          (doc) => doc.data().conversation
        );
        messages = messages.concat(
          querySnapshot2.docs.map((doc) => doc.data().conversation)
        );
        messages = messages.sort(
          (message1, message2) =>
            message1.timestamp?.seconds - message2.timestamp?.seconds
        );
        setAllMessages(messages);
      }
    };

    const unsub1 = onSnapshot(queryResult1, (snapshot) => {
      const messages = snapshot.docs.map((doc) => doc.data().conversation);
      setAllMessages(messages);
    });
    const unsub2 = onSnapshot(queryResult2, (snapshot) => {
      const messages = snapshot.docs.map((doc) => doc.data().conversation);
      setAllMessages(messages);
    });

    fetchMessages();
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  // console.log(" tous les messages = ", JSON.stringify(allMessages, null, 2));

  const HandleSubmit = async () => {
    const querySnapshot1 = await getDocs(queryResult1);
    const querySnapshot2 = await getDocs(queryResult2);

    if (!querySnapshot1.empty || !querySnapshot2.empty) {
      querySnapshot1.forEach((document) => {
        updateDoc(doc(db, "Chats", document.id), {
          conversation: [
            ...document.data().conversation,
            {
              message: message,
              timestamp: Timestamp.now(),
              sender: sender,
            },
          ],
        });
      });
      querySnapshot2.forEach((document) => {
        updateDoc(doc(db, "Chats", document.id), {
          conversation: [
            ...document.data().conversation,
            {
              message: message,
              timestamp: Timestamp.now(),
              sender: sender,
            },
          ],
        });
      });
    } else {
      await addDoc(chatRef, {
        chatters: `${sender}xx${friendName}`,
        conversation: [
          {
            message: message,
            timestamp: Timestamp.now(),
            sender: sender,
          },
        ],
      });
    }

    async function retryRequest(maxRetries = 3) {
      let retries = 0;
      while (retries < maxRetries) {
        try {
          const response = await axios.post(
            `https://app.nativenotify.com/api/indie/notification`,
            {
              subID: `${friendEmail}`,
              appId: 10248,
              appToken: "guKtuq4T1NWVPPbt1jZuFl",
              title: `${sender} - SpeakON`,
              message: `${message}`,
            }
          );
          console.log("success");
          return response;
        } catch (error) {
          retries++;
          console.log("request failed, retrying ...", error.message);
        }
      }
    }

    retryRequest();
    setMessage("");
  };

  return (
    <View className="flex-1 justify-end">
      {allMessages[0] !== undefined && (
        <View className="flex-1">
          <FlatList
            data={allMessages[0]}
            ref={flatListRef}
            onContentSizeChange={() =>
              flatListRef?.current?.scrollToEnd({ animated: true })
            }
            initialNumberToRender={10}
            keyExtrator={(item) => item.timestamp}
            renderItem={({ item }) => (
              <MessageItem item={item} sender={sender} />
            )}
          />
        </View>
      )}
      <View className="flex-row">
        <TextInput
          placeholder="Ecrire ici ..."
          multiline={true}
          keyboardType="default"
          value={message}
          onChangeText={setMessage}
          className="bg-white rounded-lg w-[80%] text-base py-2 px-1 mx-3 mb-5 tracking-wide"
        />
        <TouchableOpacity onPress={HandleSubmit}>
          <MaterialCommunityIcons name="send-circle" size={40} color="orange" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatScreen;
