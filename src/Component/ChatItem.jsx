import { View, Text } from "react-native";
import React from "react";
import { TouchableOpacity } from "react-native";
import { Image } from "react-native";

const userAvatar = require("../../assets/man.png");

const ChatItem = ({ navigation, friend }) => {
  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("Chat", {
          friendName: friend.name,
          friendAvatar: friend.avatar,
          friendEmail: friend.email,
        })
      }
      className="mt-1 mx-2"
    >
      <View className="flex-row items-center bg-white my-2 py-2 rounded-lg">
        {friend.avatar !== undefined ? (
          <Image
            source={{ uri: friend.avatar }}
            className="h-12 w-12 rounded-full mx-3"
          />
        ) : (
          <Image source={userAvatar} className="h-12 w-12 rounded-full mx-3" />
        )}
        <View>
          <Text className="font-medium tracking-widest text-lg">
            {friend.name}
          </Text>
          <Text className="text-gray-500 tracking-tight text-sm max-h-7">
            {friend.lastMessage[0]?.message}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ChatItem;
