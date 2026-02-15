import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDeliveryGroupItemsQuery } from '@/hooks/queries/useDeliveryGroupItemsQuery'
import { useDeliveryModulesQuery } from '@/hooks/queries/useDeliveryModulesQuery'
import {
  createDeliveryGroupItem,
  deleteDeliveryGroupItem,
} from '@/services/deliveryGroupItemService'
import { queryKeys } from '@/lib/queryKeys'
import { toast } from 'sonner'

export function useDeliveryGroupItems(deliveryGroupId: string) {
  const queryClient = useQueryClient()

  // Queries
  const { data: items = [], isLoading: isItemsLoading } =
    useDeliveryGroupItemsQuery(deliveryGroupId)

  const { data: modules = [], isLoading: isModulesLoading } =
    useDeliveryModulesQuery()

  const isLoading = isItemsLoading || isModulesLoading

  // Form state
  const [selectedModuleId, setSelectedModuleId] = useState('')
  const [selectedContentId, setSelectedContentId] = useState('')
  const [packageType, setPackageType] = useState('Standard Packing')
  const [remarks, setRemarks] = useState('')
  const [specialAddress, setSpecialAddress] = useState('')

  // Delete confirmation state
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  // Derived
  const selectedModule = modules.find((m) => m.id === selectedModuleId)
  const availableContents = selectedModule?.contents || []

  const itemsQueryKey = queryKeys.delivery.groupItems(deliveryGroupId)

  // Mutations
  const addItemMutation = useMutation({
    mutationFn: () =>
      createDeliveryGroupItem(deliveryGroupId, {
        delivery_module_content_id: selectedContentId,
        package_type: packageType,
        remarks: remarks || null,
        special_delivery_address: specialAddress || null,
      }),
    onSuccess: () => {
      toast.success('Item added successfully')
      queryClient.invalidateQueries({ queryKey: itemsQueryKey })
      // Reset form
      setSelectedContentId('')
      setRemarks('')
      setSpecialAddress('')
    },
    onError: (error) => {
      console.error('Failed to add item', error)
      toast.error('Failed to add item')
    },
  })

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) =>
      deleteDeliveryGroupItem(deliveryGroupId, itemId),
    onSuccess: () => {
      toast.success('Item removed')
      queryClient.invalidateQueries({ queryKey: itemsQueryKey })
    },
    onError: (error) => {
      console.error('Failed to delete item', error)
      toast.error('Failed to remove item')
    },
  })

  // Handlers
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedContentId) {
      toast.error('Please select module content')
      return
    }
    addItemMutation.mutate()
  }

  const handleModuleChange = (val: string) => {
    setSelectedModuleId(val)
    setSelectedContentId('')
  }

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteItemMutation.mutate(itemToDelete)
      setItemToDelete(null)
    }
  }

  return {
    items,
    modules,
    isLoading,
    isAdding: addItemMutation.isPending,

    // Form state
    selectedModuleId,
    selectedContentId,
    packageType,
    remarks,
    specialAddress,
    availableContents,
    handleModuleChange,
    setSelectedContentId,
    setPackageType,
    setRemarks,
    setSpecialAddress,
    handleAdd,

    // Delete confirmation
    itemToDelete,
    setItemToDelete,
    confirmDelete,
  }
}
