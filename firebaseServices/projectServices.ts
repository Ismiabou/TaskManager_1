// src/firebaseServices/projectServices.ts
import { db } from '../config/firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
// import { Project } from '../store/slices/projectSlice'; // Assurez-vous d'avoir le type Project

const projectsCollectionRef = collection(db, 'projects');

// Exemple de type Project (à adapter selon votre slice)
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  userId: string;
  updatedAt?: string;
}

const mapFirestoreDocToProject = (doc: any): Project => {
  return {
    id: doc.id,
    name: doc.data().name,
    description: doc.data().description || '',
    createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString(),
    userId: doc.data().userId,
    updatedAt: doc.data().updatedAt?.toDate()?.toISOString() || null,
  };
};

export const createProjectInFirestore = async (project: Omit<Project, 'id' | 'createdAt' | 'userId' | 'updatedAt'>, userId: string) => {
  const docRef = await addDoc(projectsCollectionRef, {
    ...project,
    userId: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return { id: docRef.id, ...project, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userId };
};

export const getProjectsFromFirestore = async (userId: string): Promise<Project[]> => {
  const q = query(projectsCollectionRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(mapFirestoreDocToProject);
};

export const updateProjectInFirestore = async (project: Project) => {
  const projectDocRef = doc(db, 'projects', project.id);
  await updateDoc(projectDocRef, {
    name: project.name,
    description: project.description,
    updatedAt: new Date(),
  });
};

export const deleteProjectFromFirestore = async (projectId: string) => {
  const projectDocRef = doc(db, 'projects', projectId);
  await deleteDoc(projectDocRef);
};