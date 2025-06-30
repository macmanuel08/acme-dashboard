'use server'; // marking all the exported functions within the file as Server Actions.

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, {ssl: 'require'});

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.'
    }),
    amount: z.coerce
        .number()
        .gt(0, {message: 'Please enter an amount greater than $0.'}),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.'
    }),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({id: true, date: true });

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
    const validatedFields = CreateInvoice.safeParse({  //parse vs. safeParse
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    // console.log(validatedFields);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice'
        }
    }

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100; // It's usually good practice to store monetary values in cents in your database to eliminate JavaScript floating-point errors and ensure greater accuracy.
    const date = new Date().toISOString().split('T')[0]; // create a new date with the format "YYYY-MM-DD" for the invoice's creation date

    try {
        await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;
    } catch (error) {
       return {
        message: `Database Error: Failed to Create Invoice. ${error}`
       }
    }

    revalidatePath('/dashboard/invoices'); // Since you're updating the data displayed in the invoices route, you want to clear this cache and trigger a new request to the server.
    redirect('/dashboard/invoices'); // redirect the user back to the /dashboard/invoices page
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({ // parse vs. safeParse
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    
    const amountInCents = amount * 100;
    
    try {
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
        `;
    } catch (error) {
        throw new Error(`Failed to update invoice: ${(error as Error).message}`);
    }
    
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
}