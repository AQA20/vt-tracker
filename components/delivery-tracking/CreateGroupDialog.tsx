'use client'

import { useMemo, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useCreateDeliveryGroup } from '@/hooks/mutations/useCreateDeliveryGroup'
import { toast } from 'sonner'
import { DeliveryGroup } from '@/types'

const formSchema = z.object({
  name: z.string().min(1, 'Please select a delivery group'),
})

interface CreateGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unitId: string
  existingGroups: DeliveryGroup[]
  onSuccess: () => void
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  unitId,
  existingGroups,
  onSuccess,
}: CreateGroupDialogProps) {
  const createGroup = useCreateDeliveryGroup(unitId)

  const form = useForm<z.infer<typeof formSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema as any) as any,
    defaultValues: {
      name: '',
    },
  })

  // Calculate available options (1-12) excluding existing ones
  const availableOptions = useMemo(() => {
    const existingNumbers = existingGroups.map((g) => {
      // Extract number from "Delivery Group X" or just "Group X" or if it has a number at the end
      if (g.group_number) return g.group_number
      if (!g?.group_name) return 0
      const match = g.group_name.match(/(\d+)$/)
      return match ? parseInt(match[0]) : 0
    })

    const options = []
    const start =
      existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1

    for (let i = 1; i <= 12; i++) {
      if (!existingNumbers.includes(i) && i >= start) {
        options.push(`Delivery Group ${i}`)
      }
    }

    // Fallback: if all 1-12 are taken or logic is weird, allow the immediate next one
    if (options.length === 0) {
      options.push(`Delivery Group ${start}`)
    }

    return options
  }, [existingGroups])

  // Set default value to first available option when dialog opens
  useEffect(() => {
    if (open && availableOptions.length > 0) {
      form.setValue('name', availableOptions[0])
    }
  }, [open, availableOptions, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Extract number from "Delivery Group X"
      const match = values.name.match(/(\d+)$/)
      const group_number = match ? parseInt(match[0]) : 0

      await createGroup.mutateAsync({
        group_name: values.name,
        group_number: group_number,
      })
      toast.success('Delivery group created successfully')
      form.reset()
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error(
        'Failed to create delivery group',
        error instanceof Error ? error.message : error,
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Delivery Group</DialogTitle>
          <DialogDescription>
            Select the next delivery group to create.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a delivery group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={createGroup.isPending}>
                {createGroup.isPending ? 'Creating...' : 'Create Group'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
