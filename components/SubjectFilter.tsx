"use client";
import React, { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { subjects } from "@/constants";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";


const SubjectFilter = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    // State to manage the selected subject
    const [subject, setSubject] = useState(() => searchParams.get("subject") || "all");
    // Effect to update the URL when the subject changes
    useEffect(() => {
        // Only push if the param actually changed
        const current = searchParams.get("subject") || "all";
        // Only push if the param actually changed
        if (current === subject) return;

        const params = new URLSearchParams(searchParams.toString());
        if (subject === "all") {
            params.delete("subject");
        } else {
            params.set("subject", subject);
        }
        router.push(`?${params.toString()}`, { scroll: false });
    }, [subject, router, searchParams]);

    return (
        <Select onValueChange={setSubject} value={subject}>
            <SelectTrigger className="input capitalize">
                <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All subjects</SelectItem>
                {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject} className="capitalize">
                        {subject}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default SubjectFilter;
