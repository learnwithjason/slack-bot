import { firebaseAdmin } from "./firebase";

const firestore = firebaseAdmin.firestore();

export const createHype = async (hypeData) => {
  return firestore.collection("hypeEvents").add(hypeData);
};

export const createGoal = async (goalData) => {
  return firestore.collection("goals").add(goalData);
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

export const getUserByEmail = async (email) => {
  return firestore
    .collection("users")
    .where("email", "==", email)
    .get()
    .then(format);
};

export const getUserGoals = async (uid) => {
  return firestore
    .collection("goals")
    .where("user_id", "==", uid)
    .get()
    .then(format);
};

export const getUserHypes = async (uid) => {
  return firestore
    .collection("hypeEvents")
    .where("user_id", "==", uid)
    .orderBy("date", "desc")
    .limitToLast(7)
    .get()
    .then(format);
};

//helper function
// Format Firestore response (handles a collection or single doc)
function format(response) {
  if (response.docs) {
    return response.docs.map(getDoc);
  } else {
    return getDoc(response);
  }
}

function getDoc(doc) {
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}
