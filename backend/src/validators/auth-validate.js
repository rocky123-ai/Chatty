import z from "zod"

export const loginSchema=z.object({
    email:z.string().trim().email({message:"Please enter a valid email address"}),
    password:z.string().trim().min(6,{message:"Password should be atleast 6 characters"})
})

export const signupSchema=loginSchema.extend({
    fullName:z.string().trim(),
})
