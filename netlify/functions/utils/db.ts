import { firebaseAdmin } from "./firebase";
import { v4 as uuidv4 } from "uuid";
import { SlackOption } from "./interfaces";

const firestore = firebaseAdmin.firestore();

export const getSlackAccount = async (teamId) => {
  return firestore
    .collection("slack")
    .where("team_id", "==", teamId)
    .get()
    .then(format);
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
    .where("uid", "==", uid)
    .get()
    .then(format);
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

// TODO(aashni): add a flag to see if the Slack Account is active or old
export const getSlackAccounts = async () => {
  return firestore.collection("slack").get().then(format);
};

export const createSlackUser = async (data) => {
  return firestore.collection("slackUsers").add(data);
};

export const getSlackUsers = async (slackId) => {
  return firestore
    .collection("slackUsers")
    .where("slack_id", "==", slackId)
    .get()
    .then(format);
};

export const getSlackUserFromUidAndTeamId = async (userId, teamId) => {
  console.log(`inside getSlackUser, userId: ${userId}, teamId: ${teamId}`);
  return firestore
    .collection("slackUsers")
    .where("user_id", "==", userId)
    .where("team_id", "==", teamId)
    .get()
    .then(format);
};

export const getUserSlackFromUserSlackId = async (userSlackId) => {
  return firestore
    .collection("slackUsers")
    .where("user_slack_id", "==", userSlackId)
    .get()
    .then(format);
};

export async function getSlackListFromUserId(
  userId: string
): Promise<SlackOption[]> {
  let slackUserList: any[] = [];
  let slackList: SlackOption[] = [];

  return firestore
    .collection("slackUsers")
    .where("user_id", "==", userId)
    .get()
    .then((userSlacksSnapshot) => {
      if (userSlacksSnapshot.empty) {
        return slackList;
      }

      // array to store the slackIds
      const slackIds: any[] = [];
      userSlacksSnapshot.forEach((doc) => {
        slackIds.push(doc.get("slack_id"));
        let key = doc.get("slack_id");
        slackUserList[key] = doc.data();
      });

      // Process slackIds in batches to avoid limit issues
      const batchSize = 10; // Define the batch size
      const batches: any[] = [];
      for (let i = 0; i < slackIds.length; i += batchSize) {
        const batch = slackIds.slice(i, i + batchSize);
        batches.push(batch);
      }

      // Process each batch of slackIds
      const promises = batches.map((batch) => {
        return firestore
          .collection("slack")
          .where("id", "in", batch)
          .get()
          .then((slackSnapshot) => {
            // Process the matching entries from the "slack" table
            slackSnapshot.forEach((slackDoc) => {
              // Access the matching entry data
              const slackData = slackDoc.data();
              slackList.push({
                wins_channel_name: slackData.wins_channel_name,
                team_name: slackData.team_name,
                id: slackData.id,
                user_slack_id: slackUserList[slackData.id].user_slack_id,
              });
            });
          });
      });

      // Execute all promises concurrently
      return Promise.all(promises)
        .then((data) => {
          return slackList; // Return slackList as the final result
        })
        .catch((error) => {
          console.log("Error processing batches:", error);
          return slackList; // Return slackList in case of error
        });
    })
    .catch((error) => {
      console.log('Error fetching user from "slackUsers" table:', error);
      return slackList; // Return slackList in case of error
    });
}

export const getSlackUsersByUId = async (userId) => {
  return firestore
    .collection("slackUsers")
    .where("user_id", "==", userId)
    .get()
    .then(format);
};

export const getSlackListBySlackIds = async (slackList) => {
  try {
    const slackItems: any[] = [];
    const maxInQuerySize = 10; // Maximum number of values per "in" query

    let slackIds = slackList.map((slack) => slack.slack_id);

    // Split the Slack IDs into chunks based on the maximum query size
    const chunks: string[][] = [];
    for (let i = 0; i < slackIds.length; i += maxInQuerySize) {
      const chunk = slackIds.slice(i, i + maxInQuerySize);
      chunks.push(chunk);
    }

    // Perform separate queries for each chunk of Slack IDs
    const queryPromises: Promise<any>[] = chunks.map((chunk) => {
      return firestore.collection("slack").where("id", "in", chunk).get();
    });

    const querySnapshots = await Promise.all(queryPromises);

    // Process the query snapshots and add matching documents to slackItems array
    querySnapshots.forEach((snapshot) => {
      snapshot.forEach((doc) => {
        slackItems.push(doc.data());
      });
    });

    return slackItems;
  } catch (error) {
    console.error("Error getting Slack items:", error);
    return [];
  }
};

const randomHypeQuery = async (randomId, comparator, userId) => {
  return firestore
    .collection("hypeEvents")
    .where("user_id", "==", userId)
    .where("currentStatus", "==", "ACTIVE")
    .where(firebaseAdmin.firestore.FieldPath.documentId(), comparator, randomId)
    .limit(1)
    .get()
    .then(format);
};

const randomGoalQuery = async (randomId, comparator, userId) => {
  return firestore
    .collection("goals")
    .where("user_id", "==", userId)
    .where("currentGoalStatus", "==", "ACTIVE_GOAL")
    .where(firebaseAdmin.firestore.FieldPath.documentId(), comparator, randomId)
    .limit(1)
    .get()
    .then(format);
};

export const getSlackFromSlackId = async (slackId) => {
  return firestore
    .collection("slack")
    .where("id", "==", slackId)
    .get()
    .then(format);
};

export const getRandomHypeForUser = async (uid) => {
  let randomId = uuidv4();

  return await randomHypeQuery(randomId, ">=", uid).then(async (result) => {
    if (result.length > 0) {
      return result;
    } else {
      return await randomHypeQuery(randomId, "<=", uid);
    }
  });
};

export const getRandomGoalForUser = async (uid) => {
  let randomId = uuidv4();

  return await randomGoalQuery(randomId, ">=", uid).then(async (result) => {
    if (result.length > 0) {
      return result;
    } else {
      return await randomGoalQuery(randomId, "<=", uid);
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
