import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

type EventData = {
    [key: string]: any;
};

export const logEvent = async (eventName: string, eventData: EventData): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, "events"), {
            name: eventName,
            data: eventData,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error logging event: ", error);
        // In a real app, you might send this to a dedicated error tracker
        // For now, we'll just throw to be handled by the caller.
        throw new Error("Could not log event.");
    }
};

export const getEvents = async (): Promise<any[]> => {
    try {
        const querySnapshot = await collection(db, "events").get();
        const events = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by creation time, newest first
        return events.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
    } catch (error) {
        console.error("Error fetching events: ", error);
        throw new Error("Could not fetch events.");
    }
}
