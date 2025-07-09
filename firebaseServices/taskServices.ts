// src/firebaseServices/taskServices.ts
import { db } from '../config/firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { Task } from '../store/slices/taskSlice'; // Assurez-vous d'avoir le type Task

const tasksCollectionRef = collection(db, 'tasks');

// Helper pour mapper les données Firestore à votre type Task
const mapFirestoreDocToTask = (doc: any): Task => {
  return {
    id: doc.id,
    title: doc.data().title,
    description: doc.data().description || '',
    completed: doc.data().completed || false,
    priority: doc.data().priority || 'Low',
    dueDate: doc.data().dueDate || null,
    createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString(),
    projectId: doc.data().projectId || null,
    updatedAt: doc.data().updatedAt?.toDate()?.toISOString() || null,
    userId: doc.data().userId, // Très important pour filtrer par utilisateur
  };
};

export const createTaskInFirestore = async (task: Omit<Task, 'id' | 'createdAt' | 'userId' | 'updatedAt'>, userId: string) => {
  const docRef = await addDoc(tasksCollectionRef, {
    ...task,
    userId: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    completed: false, // S'assurer que les nouvelles tâches ne sont pas complétées par défaut
  });
  return { id: docRef.id, ...task, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), completed: false, userId };
};

export const getTasksFromFirestore = async (userId: string): Promise<Task[]> => {
  const q = query(tasksCollectionRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(mapFirestoreDocToTask);
};

export const updateTaskInFirestore = async (task: Task) => {
  const taskDocRef = doc(db, 'tasks', task.id);
  await updateDoc(taskDocRef, {
    title: task.title,
    description: task.description,
    completed: task.completed,
    priority: task.priority,
    dueDate: task.dueDate,
    projectId: task.projectId,
    updatedAt: new Date(),
  });
};

export const deleteTaskFromFirestore = async (taskId: string) => {
  const taskDocRef = doc(db, 'tasks', taskId);
  await deleteDoc(taskDocRef);
};