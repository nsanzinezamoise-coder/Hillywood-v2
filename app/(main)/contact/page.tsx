"use client"

import React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Mail, Phone, MapPin, Send, MessageSquare, Facebook, Twitter, Instagram, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
})

export default function ContactPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    toast.success("Message sent successfully! We'll get back to you soon.")
    form.reset()
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: "hillywoodrw@gmail.com",
      description: "Our support team will respond within 24 hours.",
    },
    {
      icon: Phone,
      title: "Phone",
      details: "+250 792 881 042",
      description: "Mon-Fri from 8am to 5pm.",
    },
    {
      icon: MapPin,
      title: "Office",
      details: "KG 123 St, Kigali, Rwanda",
      description: "Visit our creative hub in the heart of Kigali.",
    },
  ]

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "Youtube" },
  ]

  return (
    <div className="min-h-screen bg-background pt-20 md:pt-28">
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 -right-4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-2 mb-6 rounded-full bg-primary/10 text-primary animate-in fade-in slide-in-from-bottom-4 duration-700">
            <MessageSquare className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Contact Us</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Let's Start a <span className="text-primary italic">Conversation</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Have a question, feedback, or just want to say hello? Our team is here to help you experience the best of Rwandan cinema.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <h2 className="text-3xl font-serif font-bold mb-4">Get in Touch</h2>
                <p className="text-muted-foreground">
                  Choose the most convenient way to reach us. Whether you're a filmmaker, a subscriber, or a partner, we're excited to hear from you.
                </p>
              </div>

              <div className="grid gap-6">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="border-none bg-card/50 backdrop-blur-sm transition-all hover:bg-card">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="p-3 rounded-2xl bg-secondary text-primary">
                        <info.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{info.title}</h3>
                        <p className="font-medium text-foreground">{info.details}</p>
                        <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div>
                <h3 className="font-bold mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                      aria-label={social.label}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <Card className="border-border/40 shadow-xl shadow-primary/5">
                <CardContent className="p-8 md:p-12">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} className="bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="john@example.com" {...field} className="bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input placeholder="How can we help?" {...field} className="bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us more about your inquiry..."
                                className="min-h-[150px] bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full h-12 rounded-xl text-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
