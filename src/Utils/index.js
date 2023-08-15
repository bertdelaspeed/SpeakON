import { Alert } from "react-native";

const combineData = (friendAvatar, sortedLastMessage) => {
  return friendAvatar.map((friend) => {
    const lastMessageData = sortedLastMessage.find((chat) =>
      chat.chatters.includes(friend.name)
    );
    return {
      ...friend,
      lastMessage: lastMessageData ? lastMessageData.message : "",
    };
  });
};

function processAuthError(authError) {
  if (authError.message.includes("user-not-found")) {
    Alert.alert("Erreur", "l'utilisateur n'existe pas. Veuillez vous inscrire");
  }
  if (authError.message.includes("wrong-password")) {
    Alert.alert("Erreur", "Mot de passe incorrect. Veuillez réessayer");
  }
  if (authError.message.includes("email-already-in-use")) {
    Alert.alert(
      "Erreur",
      "Cette adresse email est déjà utilisée, veuillez vous connecter"
    );
  }
  if (authError.message.includes("invalid-email")) {
    Alert.alert("Erreur", "Veuillez entrer une adresse mail valide");
  }
  if (authError.message.includes("network-request-failed")) {
    Alert.alert("Erreur", "Veuillez verifier votre connexion internet");
  }
}

export { combineData, processAuthError };
