'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useUpdateSupplyChainReference } from '@/hooks/mutations/useUpdateSupplyChainReference'
import { toast } from 'sonner'
import { SupplyChainReference } from '@/types'

const formSchema = z.object({
  dir_reference: z.string().optional(),
  csp_reference: z.string().optional(),
  source: z.string().optional(),
  delivery_terms: z.string().optional(),
})

interface SupplyChainDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deliveryGroupId: string
  initialData?: SupplyChainReference
  onSuccess: () => void
}

export function SupplyChainDialog({
  open,
  onOpenChange,
  deliveryGroupId,
  initialData,
  onSuccess,
}: SupplyChainDialogProps) {
  const updateSupplyChain = useUpdateSupplyChainReference()

  const form = useForm<z.infer<typeof formSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema as any) as any,
    defaultValues: {
      dir_reference: '',
      csp_reference: '',
      source: '',
      delivery_terms: '',
    },
    values: {
      dir_reference: initialData?.dir_reference || '',
      csp_reference: initialData?.csp_reference || '',
      source: initialData?.source || '',
      delivery_terms: initialData?.delivery_terms || '',
    },
  })

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        dir_reference: initialData.dir_reference || '',
        csp_reference: initialData.csp_reference || '',
        source: initialData.source || '',
        delivery_terms: initialData.delivery_terms || '',
      })
    }
  }, [initialData, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateSupplyChain.mutateAsync({
        deliveryGroupId,
        payload: values,
      })
      toast.success('References updated successfully')
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('Failed to update references', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Supply Chain References</DialogTitle>
          <DialogDescription>
            Update supply chain details for this milestone.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dir_reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DIR Reference</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. DIR-123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="csp_reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CSP Reference</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. CSP-123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Europe Supply" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="delivery_terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Terms</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. CIF" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={updateSupplyChain.isPending}>
                {updateSupplyChain.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
