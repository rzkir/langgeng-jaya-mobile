import { useMemo, useState } from 'react'

import { useAuth } from '@/context/AuthContext'

import { fetchTransactions } from '@/services/FetchTransactions'

import { useQuery } from '@tanstack/react-query'

function useTransactionsList() {
    const { user } = useAuth()
    const branchName = user?.branchName ?? ''
    const limit = 100

    const { data, isLoading, error, refetch, isRefetching } = useQuery({
        queryKey: ['transactions-list', branchName, 1, limit],
        queryFn: () => fetchTransactions(branchName, 1, limit),
        enabled: !!branchName,
    })

    const records = useMemo(() => {
        const txs = data?.data ?? []
        return txs.map((tx) => {
            let itemsCount = 0
            try {
                const parsed = JSON.parse(tx.items ?? '[]')
                if (Array.isArray(parsed)) itemsCount = parsed.length
            } catch {
                itemsCount = 0
            }
            const created = tx.created_at ? new Date(tx.created_at) : null
            const time = created
                ? created.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                : ''
            const customerName = tx.customer_name?.trim() ? tx.customer_name : 'Transaksi Tamu'
            const paymentMethodLabel =
                tx.payment_method === 'cash' ? 'Cash' : tx.payment_method === 'kasbon' ? 'Kasbon' : tx.payment_method
            return {
                id: tx.id,
                customerName,
                orderCode: tx.transaction_number,
                time,
                amount: tx.total,
                status: tx.status as TxStatus,
                paymentStatus: tx.payment_status,
                paymentMethodLabel,
                itemsCount,
                createdAt: created,
            }
        })
    }, [data?.data])

    const rawTransactions = data?.data ?? []
    return { records, rawTransactions, isLoading, error, refetch, isRefetching }
}

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export type ByMonthItem = {
    ym: string
    label: string
    fullLabel: string
    amount: number
    count: number
}

export type FilteredStats = { total: number; count: number; avg: number }

export type TopProductItem = { name: string; quantity: number; subtotal: number }

type UseStateAllTransactionsOptions = {
    initialFilterPaymentStatus?: FilterPaymentStatus
}

export function useStateAllTransactions(options?: UseStateAllTransactionsOptions) {
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
    const [filterPaymentStatus, setFilterPaymentStatus] = useState<FilterPaymentStatus>(
        options?.initialFilterPaymentStatus ?? 'all'
    )
    const [filterMonth, setFilterMonth] = useState<string>('all')
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
    const [isMonthSheetOpen, setIsMonthSheetOpen] = useState(false)
    const { records, rawTransactions, isLoading, error, refetch, isRefetching } = useTransactionsList()

    const availableMonths = useMemo(() => {
        const set = new Set<string>()
        records.forEach((r) => {
            const d = r.createdAt
            if (d) {
                const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                set.add(ym)
            }
        })
        return Array.from(set).sort((a, b) => b.localeCompare(a))
    }, [records])

    const filtered = useMemo(() => {
        let result = records

        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase()
            result = result.filter((r) => {
                const matchName = r.customerName.toLowerCase().includes(q)
                const matchCode = r.orderCode.toLowerCase().includes(q)
                return matchName || matchCode
            })
        }

        if (filterStatus !== 'all') {
            result = result.filter((r) => r.status === filterStatus)
        }

        if (filterPaymentStatus !== 'all') {
            result = result.filter((r) => r.paymentStatus === filterPaymentStatus)
        }

        if (filterMonth !== 'all') {
            result = result.filter((r) => {
                const d = r.createdAt
                if (!d) return false
                const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                return ym === filterMonth
            })
        }

        return result
    }, [records, searchQuery, filterStatus, filterPaymentStatus, filterMonth])

    const { byMonth, totalAmount, totalCount, avg } = useMemo(() => {
        const map = new Map<string, { amount: number; count: number }>()
        records.forEach((r) => {
            const d = r.createdAt
            if (!d) return
            const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            const cur = map.get(ym) ?? { amount: 0, count: 0 }
            cur.amount += r.amount
            cur.count += 1
            map.set(ym, cur)
        })
        const sorted = Array.from(map.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([ym, v]) => {
                const [y, m] = ym.split('-')
                const mi = parseInt(m, 10) - 1
                return {
                    ym,
                    label: `${MONTH_SHORT[mi]} ${y.slice(2)}`,
                    fullLabel: `${MONTH_NAMES[mi]} ${y}`,
                    ...v,
                }
            })
        const totalAmount = records.reduce((sum, r) => sum + r.amount, 0)
        const totalCount = records.length
        const avg = totalCount > 0 ? totalAmount / totalCount : 0
        return {
            byMonth: sorted,
            totalAmount,
            totalCount,
            avg,
        }
    }, [records])

    const topMonth = useMemo(() => {
        if (byMonth.length === 0) return null
        return byMonth.reduce((best, cur) => (cur.amount > best.amount ? cur : best))
    }, [byMonth])

    const chartData = useMemo(() => {
        const take = 6
        const slice = byMonth.length <= take ? byMonth : byMonth.slice(-take)
        const max = Math.max(1, ...slice.map((x) => x.amount))
        return slice.map((d) => ({ ...d, max, ratio: d.amount / max }))
    }, [byMonth])

    const filteredStats = useMemo(() => {
        const total = filtered.reduce((sum, r) => sum + r.amount, 0)
        const count = filtered.length
        const avg = count > 0 ? total / count : 0
        return { total, count, avg }
    }, [filtered])

    const topProducts = useMemo(() => {
        const rawFiltered =
            filterMonth === 'all'
                ? rawTransactions
                : rawTransactions.filter((tx) => {
                    if (!tx.created_at) return false
                    const d = new Date(tx.created_at)
                    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                    return ym === filterMonth
                })
        const byProduct = new Map<string, { name: string; quantity: number; subtotal: number }>()
        rawFiltered.forEach((tx) => {
            try {
                const items = JSON.parse(tx.items ?? '[]') as { product_id?: string; product_name?: string; quantity?: number; subtotal?: number }[]
                if (!Array.isArray(items)) return
                items.forEach((item) => {
                    const id = item.product_id ?? item.product_name ?? 'unknown'
                    const name = (item.product_name ?? 'Produk').trim() || 'Produk'
                    const qty = typeof item.quantity === 'number' ? item.quantity : 0
                    const sub = typeof item.subtotal === 'number' ? item.subtotal : 0
                    const cur = byProduct.get(id) ?? { name, quantity: 0, subtotal: 0 }
                    cur.quantity += qty
                    cur.subtotal += sub
                    cur.name = name
                    byProduct.set(id, cur)
                })
            } catch {
                // ignore invalid items
            }
        })
        return Array.from(byProduct.values())
            .sort((a, b) => b.subtotal - a.subtotal)
            .slice(0, 10)
    }, [rawTransactions, filterMonth])

    return {
        searchQuery,
        setSearchQuery,
        filterStatus,
        setFilterStatus,
        filterPaymentStatus,
        setFilterPaymentStatus,
        filterMonth,
        setFilterMonth,
        availableMonths,
        MONTH_NAMES,
        isFilterSheetOpen,
        setIsFilterSheetOpen,
        isMonthSheetOpen,
        setIsMonthSheetOpen,
        records,
        rawTransactions,
        filtered,
        isLoading,
        error,
        refetch,
        isRefetching,
        byMonth,
        totalAmount,
        totalCount,
        avg,
        topMonth,
        chartData,
        filteredStats,
        topProducts,
    }
}
