import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { SimpleLineIcons } from "@expo/vector-icons";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";

const ecureil = require("../../assets/squirrel-no-bg.png");
const userAvatar = require("../../assets/man.png");

const SearchScreen = () => {
  const navigation = useNavigation();

  const [searchFriend, setSearchFriend] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [found, setFound] = useState(false);
  const [searchedFriendName, setSearchedFriendName] = useState([]);

  const HandleSearch = async () => {
    if (searchFriend === "") {
      setSearchedFriendName([]);
      Alert.alert("Veuillez entrer un nom d'utilisateur");
    } else {
      setIsLoading(true);
      const UserRef = collection(db, "Users");
      const queryResult = query(
        UserRef,
        where("username", ">=", searchFriend.trim()),
        where("username", "<=", searchFriend.trim() + "\uf8ff")
      );

      const querySnapshot = await getDocs(queryResult);
      if (!querySnapshot.empty) {
        let friends = [];
        querySnapshot.forEach((document) => {
          const { profilePic, username, email } = document.data();
          friends.push({ profilePic, username, email });
        });
        setSearchedFriendName(friends);
        setFound(true);
      } else {
        setFound(false);
      }
      setIsLoading(false);
    }
  };

  // console.log("liste des utlisateurs", searchedFriendName);

  return (
    <View className="bg-gray-200 flex-1">
      <View className="flex-row items-center m-3 mb-10">
        <TextInput
          className="tracking-widest bg-gray-100 rounded-lg text-base
         py-2 px-1 mx-2 w-[85%]"
          onSubmitEditing={HandleSearch}
          placeholder="Rechercher un utilisateur"
          autoCapitalize="none"
          keyboardType="default"
          value={searchFriend}
          onChangeText={setSearchFriend}
          textContentType="name"
        />
        <TouchableOpacity
          onPress={HandleSearch}
          className="bg-orange-500 w-10 h-11 rounded-lg items-center justify-center"
        >
          <SimpleLineIcons name="magnifier" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size={"large"} color="gray" />
      ) : found ? (
        <View>
          <FlatList
            data={searchedFriendName}
            keyExtractor={(item) => item.username}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.replace("Chat", {
                    friendName: item.username,
                    friendAvatar: item.profilePic,
                    friendEmail: item.email,
                  })
                }
              >
                <View className="flex-row items-center space-x-4 bg-gray-100 p-2 rounded-lg mx-4">
                  {item.profilePic !== undefined ? (
                    <Image
                      source={{ uri: item.profilePic }}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <Image
                      source={userAvatar}
                      className="h-12 w-12 rounded-full"
                    />
                  )}
                  <Text className="text-lg tracking-widest text-gray-500">
                    {item.username}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      ) : (
        <View className="items-center mx-5">
          <Image source={ecureil} className="h-auto w-auto mb-3" />
          <Text className="text-2xl font-bold text-gray-500">
            Aucun utilisateur trouvé
          </Text>
        </View>
      )}
    </View>
  );
};

export default SearchScreen;
