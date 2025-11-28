import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_QUESTIONS_BY_SELLER, ANSWER_QUESTION } from "@/graphql/questions";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";

interface SellerQuestionsData {
    questionsBySeller: {
        id: number;
        content: string;
        answer?: string;
        createdAt: string;
        product: {
            title: string;
            images: { url: string }[];
        };
        author: {
            name: string;
        };
    }[];
}

export default function SellerQuestions() {
    const { user } = useAuth();
    const { data, loading, error, refetch } = useQuery<SellerQuestionsData>(GET_QUESTIONS_BY_SELLER, {
        variables: { sellerId: user?.id },
        skip: !user,
        fetchPolicy: "network-only",
        notifyOnNetworkStatusChange: true,
    });
    const [answerQuestion] = useMutation(ANSWER_QUESTION);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [answerText, setAnswerText] = useState("");

    const handleReply = (questionId: number) => {
        answerQuestion({
            variables: {
                input: {
                    id: questionId,
                    answer: answerText,
                },
            },
            onCompleted: () => {
                setReplyingTo(null);
                setAnswerText("");
                refetch();
            },
        });
    };

    if (loading) return <div className="p-8 text-center">Cargando preguntas...</div>;
    if (error) return (
        <div className="p-8 text-center text-red-500">
            Error al cargar preguntas: {error.message}
            <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-4">Reintentar</Button>
        </div>
    );

    const questions = data?.questionsBySeller || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Preguntas de Compradores</h2>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualizar
                </Button>
            </div>

            <div className="space-y-4">
                {questions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                        <p className="text-gray-500">No tienes preguntas pendientes.</p>
                    </div>
                ) : (
                    questions.map((q) => (
                        <div key={q.id} className="bg-white p-4 rounded-lg border shadow-sm">
                            <div className="flex gap-4">
                                <div className="h-16 w-16 relative bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                    {q.product.images?.[0]?.url && (
                                        <Image
                                            src={q.product.images[0].url}
                                            alt={q.product.title}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-medium text-gray-900">{q.product.title}</h3>
                                        <span className="text-xs text-gray-500">
                                            {format(new Date(q.createdAt), "dd MMM yyyy", { locale: es })}
                                        </span>
                                    </div>
                                    <div className="mt-2 bg-gray-50 p-3 rounded-md">
                                        <p className="text-sm text-gray-800">
                                            <span className="font-bold mr-2">{q.author.name}:</span>
                                            {q.content}
                                        </p>
                                    </div>

                                    {q.answer ? (
                                        <div className="mt-2 ml-4 bg-purple-50 p-3 rounded-md border-l-4 border-purple-500">
                                            <p className="text-sm text-gray-800">
                                                <span className="font-bold mr-2">Tú:</span>
                                                {q.answer}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="mt-3">
                                            {replyingTo === q.id ? (
                                                <div className="space-y-2">
                                                    <Textarea
                                                        value={answerText}
                                                        onChange={(e) => setAnswerText(e.target.value)}
                                                        placeholder="Escribe tu respuesta..."
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button size="sm" onClick={() => handleReply(q.id)}>Responder</Button>
                                                        <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>Cancelar</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Button size="sm" variant="outline" onClick={() => setReplyingTo(q.id)}>
                                                    Responder
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
