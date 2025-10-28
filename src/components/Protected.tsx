"use client";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Protected({ children }: { children: ReactNode }) {
    const router = useRouter();
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) router.replace("/login");
    }, [router]);
    return <>{children}</>;
}