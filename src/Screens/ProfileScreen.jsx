import { View, Text, Alert } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthenticatedUserContext } from "../../Context/AuthenticationContext";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { ActivityIndicator } from "react-native";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const storage = getStorage();

  const [username, setUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userImageUrl, setUserImageUrl] = useState(null);

  const { setUser, user, setUserAvatarUrl } = useContext(
    AuthenticatedUserContext
  );

  const UserRef = collection(db, "Users");
  const queryResult = query(UserRef, where("email", "==", user.email));

  async function DocFinder(queryResult) {
    const querySnapshot = await getDocs(queryResult);
    querySnapshot.forEach((doc) => {
      if (userEmail === "") {
        const { email, username, profilePic } = doc.data();
        setUsername(username);
        setUserEmail(email);
        setUserAvatarUrl(profilePic);
        setUserImageUrl(profilePic);
      }
    });
  }

  useEffect(() => {
    if (!user) return;
    DocFinder(queryResult);
  }, []);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    // console.log(result);

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (image) => {
    try {
      setIsLoading(true);

      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function (e) {
          // console.log(e);
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", image, true);
        xhr.send(null);
      });

      // console.log("blob = ", JSON.stringify(blob, null, 2));

      const filename = image.substring(image.lastIndexOf("/"));
      // console.log("filename = ", filename);
      const imageRef = ref(storage, `ProfilePictures/${filename}`);
      // console.log("imageRef = ", imageRef);
      try {
        uploadBytes(imageRef, blob).then(async () => {
          // console.log("inside upload bytes");
          const downloadUrl = await getDownloadURL(imageRef);

          const querySnapshot = await getDocs(queryResult);
          querySnapshot.forEach(async (document) => {
            await updateDoc(doc(db, "Users", document.id), {
              profilePic: downloadUrl,
            }).then(() => {
              setUserImageUrl(downloadUrl), setUserAvatarUrl(downloadUrl);
              setIsLoading(false);
            });
          });
        });
      } catch (error) {
        console.error("error connexion = ", JSON.stringify(error, null, 2));
      }
    } catch (error) {
      Alert.alert("error", error.message);
      setIsLoading(false);
    }
  };

  const Deconnexion = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        navigation.navigate("Login");
      })
      .catch((error) => {
        Alert.alert("Error", error.message);
      });
  };

  // console.log("image url = ", userImageUrl);

  return (
    <View>
      <View className="justify-center items-center my-10">
        <Text className="text-2xl font-medium tracking-widest">
          Bienvenue, <Text className="text-[#d60e45]">{username}</Text>
        </Text>
      </View>
      <TouchableOpacity
        onPress={pickImage}
        className="rounded-md bg-gray-400 items-center justify-center mx-10 mb-10"
      >
        {userImageUrl === null || userImageUrl === undefined ? (
          <Ionicons name="camera" size={50} color="white" />
        ) : isLoading ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <Image
            source={{ uri: userImageUrl }}
            className="w-full h-40 rounded-md"
          />
        )}
      </TouchableOpacity>

      <View className="items-center">
        <Text className="tracking-widest bg-gray-200 rounded-lg w-[80%] text-base py-2 px-1 mb-5 text-slate-900 font-light">
          {username}
        </Text>
        <Text className="tracking-widest bg-gray-200 rounded-lg w-[80%] text-base py-2 px-1 mb-5 text-slate-900 font-light">
          {userEmail}
        </Text>
      </View>

      <TouchableOpacity
        onPress={Deconnexion}
        className="bg-[#fac25a] py-2 rounded-md mx-10 mt-10 mb-3"
      >
        <Text className="text-center font-semibold text-white text-lg">
          Se deconnecter
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;
