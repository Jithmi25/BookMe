export const verifyProvider = functions.https.onCall(async (data, context) => {
  // Verify caller is admin
  const claims = await admin.auth().getIdTokenResult(context.auth!.uid);
  if (!claims.admin) throw new Error("Unauthorized");

  const { providerId, verificationType, approved } = data;

  if (verificationType === "nic") {
    await db.collection("providers").doc(providerId).update({
      nicVerified: approved,
    });
  } else if (verificationType === "photo") {
    await db.collection("providers").doc(providerId).update({
      photoVerified: approved,
    });
  }

  return { success: true };
});
