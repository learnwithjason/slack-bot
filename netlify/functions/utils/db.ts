import { firebaseAdmin } from "./firebase";

const firestore = firebaseAdmin.firestore();

export const createHype = async (hypeData) => {
  return firestore.collection("hypeEvents").add(hypeData);
};

export const getUser = async (uid) => {
  return firestore
    .collection("users")
    .doc(uid)
    .get()
    .then((data) => {
      return data.data();
    });
};
