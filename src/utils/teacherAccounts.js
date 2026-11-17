import {
  createUserWithEmailAndPassword,
  deleteUser,
  inMemoryPersistence,
  setPersistence,
  signOut,
} from "firebase/auth";
import { teacherAuth } from "../firebase";

export async function createTeacherAccount(email, password, saveTeacher) {
  await setPersistence(teacherAuth, inMemoryPersistence);
  const { user } = await createUserWithEmailAndPassword(
    teacherAuth,
    email,
    password
  );

  try {
    await saveTeacher(user.uid);
  } catch (error) {
    try {
      await deleteUser(user);
    } catch (cleanupError) {
      throw new Error(
        `${error.message} The login account was created but could not be removed after the save failed: ${cleanupError.message}`
      );
    }
    throw error;
  } finally {
    await signOut(teacherAuth);
  }
}
