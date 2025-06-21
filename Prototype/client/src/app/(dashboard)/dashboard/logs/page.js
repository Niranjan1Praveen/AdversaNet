"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

export default function Page() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/playground", {
          method: "GET",
        });
        const data = await res.json();
        console.log(data);

        setHistory(data);
      } catch (error) {
        console.error("Failed to load attack history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="container">
      <CardContent className="p-4 md:p-6">
        <h2 className="text-3xl font-bold mb-4">Attack History Logs</h2>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <p className="text-muted-foreground text-sm">No attack logs found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Id</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Attack</TableHead>
                <TableHead>Original Prediction</TableHead>
                <TableHead>Original Score %</TableHead>
                <TableHead>Adversarial Prediction</TableHead>
                <TableHead>Adversarial Score %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.id}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDistanceToNow(new Date(entry.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>{entry.modelUsed}</TableCell>
                  <TableCell>{entry.attackUsed}</TableCell>
                  <TableCell>{entry.originalPrediction}</TableCell>
                  <TableCell>{entry.originalConfidence * 100}</TableCell>
                  <TableCell>{entry.adversarialPrediction}</TableCell>
                  <TableCell>{entry.adversarialConfidence * 100} </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </div>
  );
}
