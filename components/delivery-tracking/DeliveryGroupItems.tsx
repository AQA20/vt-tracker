'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getDeliveryModules,
  getDeliveryGroupItems,
  createDeliveryGroupItem,
  deleteDeliveryGroupItem,
} from '@/services/deliveryGroupItemService'
import {
  DeliveryGroupItem,
  DeliveryModule,
} from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Plus, Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeliveryGroupItemsProps {
  deliveryGroupId: string
}

export function DeliveryGroupItems({
  deliveryGroupId,
}: DeliveryGroupItemsProps) {
  const [items, setItems] = useState<DeliveryGroupItem[]>([])
  const [modules, setModules] = useState<DeliveryModule[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  // Form state
  const [selectedModuleId, setSelectedModuleId] = useState<string>('')
  const [selectedContentId, setSelectedContentId] = useState<string>('')
  const [packageType, setPackageType] = useState<string>('Standard Packing')
  const [remarks, setRemarks] = useState('')
  const [specialAddress, setSpecialAddress] = useState('')

  const fetchItems = useCallback(async () => {
    try {
      const res = await getDeliveryGroupItems(deliveryGroupId)
      setItems(res.data.data)
    } catch (e) {
      console.error('Failed to fetch items', e)
    }
  }, [deliveryGroupId])

  const fetchCatalog = useCallback(async () => {
    try {
      const res = await getDeliveryModules()
      setModules(res.data.data)
    } catch (e) {
      console.error('Failed to fetch catalog', e)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchItems(), fetchCatalog()]).finally(() => setLoading(false))
  }, [fetchItems, fetchCatalog])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedContentId) {
      toast.error('Please select module content')
      return
    }

    setAdding(true)
    try {
      await createDeliveryGroupItem(deliveryGroupId, {
        delivery_module_content_id: selectedContentId,
        package_type: packageType,
        remarks: remarks || null,
        special_delivery_address: specialAddress || null,
      })
      toast.success('Item added successfully')
      fetchItems()
      // Reset form
      setSelectedContentId('')
      setRemarks('')
      setSpecialAddress('')
    } catch (e) {
      console.error('Failed to add item', e)
      toast.error('Failed to add item')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    try {
      await deleteDeliveryGroupItem(deliveryGroupId, itemId)
      toast.success('Item removed')
      fetchItems()
    } catch (e) {
      console.error('Failed to delete item', e)
      toast.error('Failed to remove item')
    }
  }

  const selectedModule = modules.find((m) => m.id === selectedModuleId)
  const availableContents = selectedModule?.contents || []

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-8">
      <div className="border rounded-lg p-4 bg-muted/20">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Add Module Item
        </h3>
        <form
          onSubmit={handleAdd}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="space-y-2">
            <Label>Module</Label>
            <Select
              value={selectedModuleId}
              onValueChange={(val) => {
                setSelectedModuleId(val)
                setSelectedContentId('')
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Module" />
              </SelectTrigger>
              <SelectContent>
                {modules.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Detailed Content</Label>
            <Select
              value={selectedContentId}
              onValueChange={setSelectedContentId}
              disabled={!selectedModuleId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Content" />
              </SelectTrigger>
              <SelectContent>
                {availableContents.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Package Type</Label>
            <Select value={packageType} onValueChange={setPackageType}>
              <SelectTrigger>
                <SelectValue placeholder="Select Package Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard Packing">
                  Standard Packing
                </SelectItem>
                <SelectItem value="Sea Packing">Sea Packing</SelectItem>
                <SelectItem value="Bark Free Packing">
                  Bark Free Packing
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Remarks</Label>
            <Input
              placeholder="Any remarks..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label>Special Delivery Address</Label>
            <Textarea
              className="resize-none"
              placeholder="Exact location or address..."
              value={specialAddress}
              onChange={(e) => setSpecialAddress(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={adding || !selectedContentId}
            >
              {adding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Group
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Module</TableHead>
              <TableHead>Detailed Content</TableHead>
              <TableHead>Package Type</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-muted-foreground"
                >
                  No items assigned to this delivery group yet.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.module_name?.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell>{item.content?.name}</TableCell>
                  <TableCell>{item.package_type}</TableCell>
                  <TableCell
                    className="max-w-xs truncate"
                    title={item.remarks || undefined}
                  >
                    {item.remarks || '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setItemToDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this item from the delivery group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (itemToDelete) {
                  handleDelete(itemToDelete)
                  setItemToDelete(null)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
