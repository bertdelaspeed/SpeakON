import { View, Text, Image, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
const backImage = require("../../assets/background_signin.jpg");
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Alert } from "react-native";
import { auth } from "../../firebase/config";
import { registerIndieID } from "native-notify";
import { processAuthError } from "../Utils";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const HandleLogin = () => {
    if (email === "" || password === "") {
      Alert.alert("error", "Remplissez tous les champs");
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then(registerIndieID(`${email}`, 10248, "guKtuq4T1NWVPPbt1jZuFl"))
        .catch((error) => processAuthError(error));
    }
  };

  return (
    <KeyboardAwareScrollView className="bg-black">
      <View>
        <Image source={backImage} className="object-cover h-80 w-full" />
      </View>
      <View className="bg-white h-screen rounded-t-3xl">
        <Text className="text-[#d60e45] text-3xl font-semibold text-center py-3 mt-3">
          Se connecter
        </Text>
        <View className="mt-10 items-center">
          <TextInput
            className="tracking-widest bg-gray-100 rounded-lg w-[80%] text-base py-2 px-1 mx-5 mb-5"
            placeholder="Entrer votre email"
            autoCapitalize="none"
            value={email}
            keyboardType="email-address"
            textContentType="emailAddress"
            onChangeText={setEmail}
          />
          <TextInput
            className="tracking-widest bg-gray-100 rounded-lg w-[80%] text-base py-2 px-1 mx-5 mb-5"
            placeholder="Entrer mot de passe"
            autoCapitalize="none"
            value={password}
            secureTextEntry={true}
            autoCorrect={false}
            textContentType="password"
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity
          onPress={HandleLogin}
          className="bg-[#fac25a] py-2 rounded-md mx-10 mt-10 mb-3"
        >
          <Text className="text-center font-semibold text-white text-lg">
            Se connecter
          </Text>
        </TouchableOpacity>

        <View className="flex-row space-x-2 justify-center">
          <Text className="font-light tracking-wider">Nouveau ici ?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text className="font-medium text-[#d60e45]">Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default LoginScreen;
