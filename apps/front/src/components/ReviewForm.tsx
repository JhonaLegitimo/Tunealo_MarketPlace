"use client"

import { useState, useEffect } from "react"
import { useMutation } from "@apollo/client/react"
import { CREATE_REVIEW, UPDATE_REVIEW } from "@/graphql/reviews"
import { GET_PRODUCT_DETAILS } from "@/graphql/products"
import { GET_MY_ORDERS } from "@/graphql/orders"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface ReviewFormProps {
    productId: number
    onSuccess?: () => void
    initialRating?: number
    initialContent?: string
    initialIsAnonymous?: boolean
    reviewId?: number
}

export function ReviewForm({
    productId,
    onSuccess,
    initialRating = 0,
    initialContent = "",
    initialIsAnonymous = false,
    reviewId
}: ReviewFormProps) {
    const [rating, setRating] = useState(initialRating)
    const [hoverRating, setHoverRating] = useState(0)
    const [content, setContent] = useState(initialContent)
    const [isAnonymous, setIsAnonymous] = useState(initialIsAnonymous)

    // Update state if props change (e.g. opening modal for different item)
    useEffect(() => {
        setRating(initialRating)
        setContent(initialContent)
        setIsAnonymous(initialIsAnonymous)
    }, [initialRating, initialContent, initialIsAnonymous])

    const [createReview, { loading: creating }] = useMutation(CREATE_REVIEW, {
        onCompleted: () => {
            console.log("Create review completed");
            toast.success("Reseña enviada exitosamente")
            if (!reviewId) {
                setRating(0)
                setContent("")
                setIsAnonymous(false)
            }
            onSuccess?.()
        },
        onError: (error: any) => {
            console.error("Create review error:", error);
            toast.error(error.message)
        },
        refetchQueries: [
            { query: GET_PRODUCT_DETAILS, variables: { id: productId } },
            { query: GET_MY_ORDERS }
        ]
    })

    const [updateReview, { loading: updating }] = useMutation(UPDATE_REVIEW, {
        onCompleted: () => {
            console.log("Update review completed");
            toast.success("Reseña actualizada exitosamente")
            onSuccess?.()
        },
        onError: (error: any) => {
            console.error("Update review error:", error);
            toast.error(error.message)
        },
        refetchQueries: [
            { query: GET_PRODUCT_DETAILS, variables: { id: productId } },
            { query: GET_MY_ORDERS }
        ]
    })

    const handleSubmit = () => {
        console.log("ReviewForm.handleSubmit called");
        console.log("State:", { rating, content, isAnonymous, reviewId, productId });

        if (rating === 0) {
            console.log("Validation failed: Rating is 0");
            toast.error("Por favor selecciona una calificación")
            return
        }

        if (content.trim().length < 10) {
            console.log("Validation failed: Content too short");
            toast.error("El comentario debe tener al menos 10 caracteres")
            return
        }

        if (reviewId) {
            console.log("Updating review...", reviewId);
            updateReview({
                variables: {
                    updateReviewInput: {
                        id: reviewId,
                        content,
                        rating,
                        isAnonymous
                    }
                }
            }).catch(err => console.error("Update mutation catch:", err));
        } else {
            console.log("Creating review for product:", productId);
            createReview({
                variables: {
                    createReviewInput: {
                        productId,
                        content,
                        rating,
                        isAnonymous
                    }
                }
            }).catch(err => console.error("Create mutation catch:", err));
        }
    }

    const loading = creating || updating

    return (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calificación
                </label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="focus:outline-none transition-transform hover:scale-110"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                        >
                            <Star
                                size={28}
                                fill={(hoverRating || rating) >= star ? "#fbbf24" : "none"}
                                className={(hoverRating || rating) >= star ? "text-yellow-400" : "text-gray-300"}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tu opinión
                </label>
                <Textarea
                    placeholder="¿Qué te pareció el producto? Cuéntanos más..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[100px] bg-white"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                    {content.length}/10 caracteres mínimos
                </p>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="anonymous"
                        checked={isAnonymous}
                        onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                    />
                    <Label htmlFor="anonymous" className="text-sm cursor-pointer">
                        Publicar como anónimo
                    </Label>
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={loading || rating === 0 || content.length < 10}
                    className="bg-primary hover:bg-red-700 text-white"
                >
                    {loading ? "Enviando..." : (reviewId ? "Actualizar Reseña" : "Publicar Reseña")}
                </Button>
            </div>
        </div>
    )
}
