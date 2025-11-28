import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ReviewForm } from "@/components/ReviewForm"

interface ReviewModalProps {
    isOpen: boolean
    onClose: () => void
    product: {
        id: number
        title: string
        image: string
    }
    existingReview?: {
        id: number
        rating: number
        content: string
        isAnonymous: boolean
    }
}

export function ReviewModal({ isOpen, onClose, product, existingReview }: ReviewModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {existingReview ? "Actualizar Reseña" : "Escribir Reseña"}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    <img
                        src={product.image}
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded"
                    />
                    <p className="font-medium text-sm line-clamp-2">{product.title}</p>
                </div>

                <ReviewForm
                    productId={product.id}
                    onSuccess={onClose}
                    initialRating={existingReview?.rating}
                    initialContent={existingReview?.content}
                    initialIsAnonymous={existingReview?.isAnonymous}
                    reviewId={existingReview?.id}
                />
            </DialogContent>
        </Dialog>
    )
}
