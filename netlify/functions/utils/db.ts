import { firebaseAdmin } from "./firebase";
import { v4 as uuidv4 } from "uuid";

const firestore = firebaseAdmin.firestore();

export const getToken = async (teamId) => {
  let resp = firestore
    .collection("slack")
    .where("team_id", "==", teamId)
    .get()
    .then(format);
  return resp;
};

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

export const getUserGoals = async (uid, limit = 0) => {
  return firestore
    .collection("goals")
    .where("user_id", "==", uid)
    .orderBy("date", "asc")
    .limitToLast(limit)
    .get()
    .then(format);
};

export const getUserHypes = async (uid, limit = 0) => {
  return firestore
    .collection("hypeEvents")
    .where("user_id", "==", uid)
    .orderBy("date", "asc")
    .limitToLast(limit)
    .get()
    .then(format);
};

const randomHypeQuery = async (randomId, comparator) => {
  return firestore
    .collection("hypeEvents")
    .where("currentStatus", "==", "ACTIVE")
    .where(firebaseAdmin.firestore.FieldPath.documentId(), comparator, randomId)
    .limit(1)
    .get()
    .then(format);
};

const randomGoalQuery = async (randomId, comparator) => {
  return firestore
    .collection("goals")
    .where("currentGoalStatus", "==", "ACTIVE_GOAL")
    .where(firebaseAdmin.firestore.FieldPath.documentId(), comparator, randomId)
    .limit(1)
    .get()
    .then(format);
};

export const getRandomHypeForUser = async (uid) => {
  let randomId = uuidv4();

  return await randomHypeQuery(randomId, ">=").then(async (result) => {
    if (result.length > 0) {
      return result;
    } else {
      return await randomHypeQuery(randomId, "<=");
    }
  });
};

export const getRandomGoalForUser = async (uid) => {
  let randomId = uuidv4();

  return await randomGoalQuery(randomId, ">=").then(async (result) => {
    if (result.length > 0) {
      return result;
    } else {
      return await randomGoalQuery(randomId, "<=");
    }
  });
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
