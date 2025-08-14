import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from "firebase/firestore";
import { AnalyticsEvent } from "@/types";

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

export const getEvents = async (): Promise<AnalyticsEvent[]> => {
    try {
        const q = query(collection(db, "events"), orderBy("createdAt", "desc"), limit(50));
        const querySnapshot = await getDocs(q);
        const events = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AnalyticsEvent));
        return events;
    } catch (error) {
        console.error("Error fetching events: ", error);
        throw new Error("Could not fetch events.");
    }
}
