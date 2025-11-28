"use client"

import { useQuery } from "@apollo/client/react"
import { GET_PRODUCT_DETAILS } from "@/graphql/products"
import { useParams } from "next/navigation"
import Image from "next/image"
import { useState } from "react"
import { Star, Heart, Share2, Truck, ShieldCheck, MapPin, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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
        Reviews: {
            id: number
            content: string
            rating: number
            createdAt: string
            author: { name: string }
        }[]
    }
}

export default function ProductPage() {
    const params = useParams()
    const id = parseInt(params.id as string)

    const { data, loading, error } = useQuery<ProductDetails>(GET_PRODUCT_DETAILS, {
        variables: { id },
        skip: !id
    })

    const [selectedImage, setSelectedImage] = useState<number>(0)
    const [question, setQuestion] = useState("")

    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando detalles...</div>
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error al cargar el producto</div>
    if (!data?.product) return <div className="min-h-screen flex items-center justify-center">Producto no encontrado</div>

    const { product } = data

    // Mock Questions Data
    const mockQuestions = [
        { id: 1, user: "Juan Perez", question: "¿Le queda a un modelo 2015?", answer: "Sí, es compatible con modelos 2014-2018.", date: "Hace 2 días" },
        { id: 2, user: "Maria G.", question: "¿Tienen en color negro?", answer: "Por el momento solo en gris plata.", date: "Hace 1 semana" },
    ]

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Breadcrumb */}
                <div className="text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-primary">Inicio</Link>
                    <span className="mx-2">/</span>
                    <span>{product.categories[0]?.name || "Autopartes"}</span>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">{product.title}</span>
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
                                <span className="text-sm text-gray-500">({product.Reviews?.length || 0} opiniones)</span>
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
                                <Button className="w-full bg-primary hover:bg-red-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg shadow-red-500/20">
                                    Comprar ahora
                                </Button>
                                <Button variant="outline" className="w-full border-primary text-primary hover:bg-red-50 font-bold py-6 text-lg rounded-xl">
                                    Agregar al carrito
                                </Button>
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

                        {/* Questions Section (Mocked) */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-6 pb-4 border-b">Preguntas y respuestas</h2>

                            <div className="flex gap-4 mb-8">
                                <input
                                    type="text"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="Escribe tu pregunta..."
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                                    Preguntar
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {mockQuestions.map((q) => (
                                    <div key={q.id} className="space-y-2">
                                        <div className="flex items-start gap-3">
                                            <MessageCircle size={18} className="text-gray-400 mt-1" />
                                            <div>
                                                <p className="font-medium text-gray-900">{q.question}</p>
                                                <div className="flex items-center gap-2 mt-2 text-gray-600 bg-gray-50 p-3 rounded-lg rounded-tl-none">
                                                    <span className="text-sm">{q.answer}</span>
                                                    <span className="text-xs text-gray-400 ml-auto">{q.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="mt-6 text-blue-600 font-medium hover:underline">Ver todas las preguntas</button>
                        </div>

                        {/* Reviews Section */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-6 pb-4 border-b">Opiniones del producto</h2>

                            <div className="flex items-center gap-8 mb-8">
                                <div className="text-center">
                                    <div className="text-5xl font-bold text-gray-900">{product.avgRating?.toFixed(1) || "0.0"}</div>
                                    <div className="flex text-yellow-400 justify-center my-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={20} fill={i < Math.round(product.avgRating || 0) ? "currentColor" : "none"} className={i < Math.round(product.avgRating || 0) ? "" : "text-gray-300"} />
                                        ))}
                                    </div>
                                    <div className="text-sm text-gray-500">{product.Reviews?.length || 0} calificaciones</div>
                                </div>
                                {/* Progress bars could go here */}
                            </div>

                            <div className="space-y-6">
                                {product.Reviews && product.Reviews.length > 0 ? (
                                    product.Reviews.map((review) => (
                                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex text-yellow-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300"} />
                                                    ))}
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{review.rating}.0</span>
                                                <span className="text-sm text-gray-400 mx-2">•</span>
                                                <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-gray-700">{review.content}</p>
                                            <div className="mt-2 text-xs text-gray-400">Por {review.author.name}</div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">Este producto aún no tiene opiniones.</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
