"use client"

import { useQuery, useMutation } from "@apollo/client/react"
import { GET_PRODUCT_DETAILS } from "@/graphql/products"
import { GET_QUESTIONS_BY_PRODUCT, CREATE_QUESTION, EDIT_QUESTION, DELETE_QUESTION } from "@/graphql/questions"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { useState } from "react"
import { Star, Heart, Share2, Truck, ShieldCheck, MapPin, MessageCircle, ArrowLeft, Pencil, Trash2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/context/CartContext"
import { toast } from "sonner"


interface ProductDetails {
    product: {
        id: number
        title: string
        description: string
        price: number
        stock: number
        avgRating?: number
        images: { url: string }[]
        seller: {
            id: number
            name: string
            email: string
        }
        categories: { name: string }[]
        reviews: {
            id: number
            content: string
            rating: number
            isAnonymous: boolean
            createdAt: string
            author: { name: string }
        }[]
    }
}

interface QuestionsData {
    questionsByProduct: {
        id: number
        content: string
        answer?: string
        createdAt: string
        author: { id: number }
    }[]
}

interface CreateQuestionData {
    createQuestion: {
        id: number
        content: string
        createdAt: string
        answer?: string
        author: {
            id: number
            name: string
        }
    }
}

export default function ProductPage() {
    const params = useParams()
    const id = parseInt(params.id as string)
    const { user } = useAuth()
    const { addToCart, openCart } = useCart()
    const router = useRouter()

    const { data, loading, error } = useQuery<ProductDetails>(GET_PRODUCT_DETAILS, {
        variables: { id },
        skip: !id
    })

    const { data: questionsData, refetch: refetchQuestions } = useQuery<QuestionsData>(GET_QUESTIONS_BY_PRODUCT, {
        variables: { productId: id },
        skip: !id,
        fetchPolicy: "cache-and-network"
    })

    const [createQuestion, { loading: creatingQuestion }] = useMutation<CreateQuestionData>(CREATE_QUESTION, {
        update: (cache, { data }) => {
            const newQuestion = data?.createQuestion;
            if (!newQuestion) return;

            const existingQuestions = cache.readQuery<QuestionsData>({
                query: GET_QUESTIONS_BY_PRODUCT,
                variables: { productId: id }
            });
            if (existingQuestions) {
                cache.writeQuery({
                    query: GET_QUESTIONS_BY_PRODUCT,
                    variables: { productId: id },
                    data: {
                        questionsByProduct: [newQuestion, ...existingQuestions.questionsByProduct]
                    }
                });
            }
        },
        onCompleted: () => {
            setQuestion("")
            toast.success("Pregunta enviada")
        },
        onError: (err) => toast.error("Error al enviar pregunta: " + err.message)
    })

    const [selectedImage, setSelectedImage] = useState<number>(0)
    const [question, setQuestion] = useState("")
    const [addingToCart, setAddingToCart] = useState(false)
    const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null)
    const [editContent, setEditContent] = useState("")

    const [editQuestion] = useMutation(EDIT_QUESTION, {
        onCompleted: () => {
            toast.success("Pregunta actualizada")
            setEditingQuestionId(null)
            refetchQuestions()
        },
        onError: (err) => toast.error("Error al actualizar: " + err.message)
    })

    const [deleteQuestion] = useMutation(DELETE_QUESTION, {
        onCompleted: () => {
            toast.success("Pregunta eliminada")
            refetchQuestions()
        },
        onError: (err) => toast.error("Error al eliminar: " + err.message)
    })

    const startEditing = (q: any) => {
        setEditingQuestionId(q.id)
        setEditContent(q.content)
    }

    const cancelEditing = () => {
        setEditingQuestionId(null)
        setEditContent("")
    }

    const saveEdit = () => {
        if (!editContent.trim()) return
        editQuestion({
            variables: {
                input: {
                    id: editingQuestionId,
                    content: editContent
                }
            }
        })
    }

    const handleDeleteQuestion = (id: number) => {
        if (confirm("¿Estás seguro de eliminar esta pregunta?")) {
            deleteQuestion({ variables: { id } })
        }
    }

    const handleAskQuestion = () => {
        if (!user) {
            toast.error("Debes iniciar sesión para preguntar")
            router.push("/login")
            return
        }
        if (!question.trim()) return

        createQuestion({
            variables: {
                input: {
                    content: question,
                    productId: id
                }
            }
        })
    }

    const handleAddToCart = async () => {
        if (!user) {
            toast.error("Debes iniciar sesión para comprar")
            router.push("/login")
            return
        }
        if (!data?.product) return

        setAddingToCart(true)
        try {
            await addToCart({
                id: data.product.id,
                title: data.product.title,
                price: data.product.price,
                images: data.product.images
            }, 1)
            openCart()
            toast.success("Agregado al carrito")
        } catch (error) {
            toast.error("Error al agregar al carrito")
        } finally {
            setAddingToCart(false)
        }
    }

    const handleBuyNow = async () => {
        if (!user) {
            toast.error("Debes iniciar sesión para comprar")
            router.push("/login")
            return
        }
        if (!data?.product) return

        setAddingToCart(true)
        try {
            await addToCart({
                id: data.product.id,
                title: data.product.title,
                price: data.product.price,
                images: data.product.images
            }, 1)
            openCart()
            // The drawer has the "Finalizar compra" button
        } catch (error) {
            toast.error("Error al procesar la compra")
        } finally {
            setAddingToCart(false)
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando detalles...</div>
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error al cargar el producto</div>
    if (!data?.product) return <div className="min-h-screen flex items-center justify-center">Producto no encontrado</div>

    const { product } = data
    const questions = questionsData?.questionsByProduct || []
    const isSeller = user?.id === product.seller.id

    console.log("ProductPage Debug:", { user, isSeller, productId: product.id, sellerId: product.seller.id })

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Back Button & Breadcrumb */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full hover:bg-gray-200"
                    >
                        <ArrowLeft size={24} />
                    </Button>
                    <div className="text-sm text-gray-500">
                        <Link href="/" className="hover:text-primary">Inicio</Link>
                        <span className="mx-2">/</span>
                        <span>{product.categories[0]?.name || "Autopartes"}</span>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-medium">{product.title}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Images */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative aspect-video flex items-center justify-center overflow-hidden">
                            <Image
                                src={product.images[selectedImage]?.url || "/placeholder.svg"}
                                alt={product.title}
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {product.images.map((img: { url: string }, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`relative w-24 h-24 flex-shrink-0 bg-white rounded-lg border-2 overflow-hidden ${selectedImage === idx ? "border-primary" : "border-transparent hover:border-gray-200"
                                        }`}
                                >
                                    <Image
                                        src={img.url}
                                        alt={`Thumbnail ${idx}`}
                                        fill
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Product Info & Actions */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    Nuevo  |  {Math.floor(Math.random() * 100) + 50} vendidos
                                </span>
                                <div className="flex gap-2">
                                    <button className="text-gray-400 hover:text-red-500 transition-colors"><Heart size={20} /></button>
                                    <button className="text-gray-400 hover:text-blue-500 transition-colors"><Share2 size={20} /></button>
                                </div>
                            </div>

                            <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                                {product.title}
                            </h1>

                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} fill={i < Math.round(product.avgRating || 0) ? "currentColor" : "none"} className={i < Math.round(product.avgRating || 0) ? "" : "text-gray-300"} />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500">({product.reviews?.length || 0} opiniones)</span>
                            </div>

                            <div className="text-4xl font-bold text-gray-900 mb-6">
                                ${product.price.toLocaleString("es-ES")}
                            </div>

                            {/* Seller Info */}
                            <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                    {product.seller.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Vendido por</p>
                                    <p className="font-medium text-gray-900">{product.seller.name}</p>
                                </div>
                            </div>

                            {/* Stock & Shipping */}
                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-3 text-green-600 font-medium">
                                    <Truck size={20} />
                                    <span>Envío gratis a todo el país</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <ShieldCheck size={20} />
                                    <span>Garantía de 30 días</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <MapPin size={20} />
                                    <span>Llega entre el {new Date(Date.now() + 86400000 * 2).toLocaleDateString()} y el {new Date(Date.now() + 86400000 * 5).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {isSeller ? (
                                    <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-center font-medium border border-yellow-200">
                                        Eres el vendedor de este producto
                                    </div>
                                ) : (
                                    <>
                                        <Button
                                            className="w-full bg-primary hover:bg-red-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg shadow-red-500/20"
                                            onClick={handleBuyNow}
                                            disabled={addingToCart}
                                        >
                                            {addingToCart ? "Procesando..." : "Comprar ahora"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full border-primary text-primary hover:bg-red-50 font-bold py-6 text-lg rounded-xl"
                                            onClick={handleAddToCart}
                                            disabled={addingToCart}
                                        >
                                            {addingToCart ? "Agregando..." : "Agregar al carrito"}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Description, Questions, Reviews */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    <div className="lg:col-span-2 space-y-8">

                        {/* Description */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-6 pb-4 border-b">Descripción</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {product.description}
                            </p>
                        </div>

                        {/* Questions Section */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-6 pb-4 border-b">Preguntas y respuestas</h2>

                            {!isSeller && (
                                <div className="flex gap-4 mb-8">
                                    <input
                                        type="text"
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        placeholder="Escribe tu pregunta..."
                                        className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                                        onClick={handleAskQuestion}
                                        disabled={creatingQuestion}
                                    >
                                        {creatingQuestion ? "Enviando..." : "Preguntar"}
                                    </Button>
                                </div>
                            )}

                            <div className="space-y-6">
                                {questions.length === 0 ? (
                                    <p className="text-gray-500 italic">Nadie ha preguntado todavía. ¡Sé el primero!</p>
                                ) : (
                                    questions.map((q) => (
                                        <div key={q.id} className="space-y-2">
                                            <div className="flex items-start gap-3">
                                                <MessageCircle size={18} className="text-gray-400 mt-1" />
                                                <div className="flex-1">
                                                    {editingQuestionId === q.id ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={editContent}
                                                                onChange={(e) => setEditContent(e.target.value)}
                                                                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                                                            />
                                                            <button onClick={saveEdit} className="text-green-600 hover:text-green-700">
                                                                <Check size={18} />
                                                            </button>
                                                            <button onClick={cancelEditing} className="text-red-600 hover:text-red-700">
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-between items-start">
                                                            <p className="font-medium text-gray-900">{q.content}</p>
                                                            {user?.id === q.author.id && (
                                                                <div className="flex gap-2 ml-2">
                                                                    <button
                                                                        onClick={() => startEditing(q)}
                                                                        className="text-gray-400 hover:text-blue-500"
                                                                        title="Editar pregunta"
                                                                    >
                                                                        <Pencil size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteQuestion(q.id)}
                                                                        className="text-gray-400 hover:text-red-500"
                                                                        title="Eliminar pregunta"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {q.answer ? (
                                                        <div className="flex items-center gap-2 mt-2 text-gray-600 bg-gray-50 p-3 rounded-lg rounded-tl-none">
                                                            <span className="text-sm">{q.answer}</span>
                                                            <span className="text-xs text-gray-400 ml-auto">
                                                                {new Date(q.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-gray-400 mt-1">Esperando respuesta...</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mt-8">
                            <h2 className="text-xl font-bold mb-6 pb-4 border-b">Opiniones de los usuarios</h2>
                            <div className="space-y-6">
                                {product.reviews && product.reviews.length > 0 ? (
                                    product.reviews.map((review) => (
                                        <div key={review.id} className="border-b pb-6 last:border-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center">
                                                    <div className="flex text-yellow-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={16}
                                                                fill={i < review.rating ? "currentColor" : "none"}
                                                                className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900 ml-2">{review.rating}.0</span>
                                                    <span className="text-sm text-gray-400 mx-2">•</span>
                                                    <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <p className="text-gray-700">{review.content}</p>
                                            <div className="mt-2 text-xs text-gray-400">
                                                Por {review.isAnonymous ? "Anónimo" : review.author.name}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">Este producto aún no tiene opiniones.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div >
        </div >

    )
}
