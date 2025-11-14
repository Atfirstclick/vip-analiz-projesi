'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface ClassWithCounts {
  id: string
  name: string
  grade: string
  season: string
  max_students: number
  is_active: boolean
  created_at: string
  studentCount: number
  scheduleCount: number
  totalHours: number
}

export default function SinifListesi({ classes }: { classes: ClassWithCounts[] }) {
  const [seasonFilter, setSeasonFilter] = useState<string>('all')
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const seasons = useMemo(() => {
    return [...new Set(classes.map(c => c.season))].sort().reverse()
  }, [classes])

  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      if (seasonFilter !== 'all' && cls.season !== seasonFilter) return false
      if (activeFilter === 'active' && !cls.is_active) return false
      if (activeFilter === 'passive' && cls.is_active) return false
      return true
    })
  }, [classes, seasonFilter, activeFilter])

  const stats = useMemo(() => {
    return {
      total: filteredClasses.length,
      active: filteredClasses.filter(c => c.is_active).length,
      totalStudents: filteredClasses.reduce((sum, c) => sum + c.studentCount, 0),
      seasonCount: seasons.length
    }
  }, [filteredClasses, seasons])

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📚 Sınıf Yönetimi</h1>
          <p className="mt-2 text-gray-600">
            Sınıfları oluşturun, düzenleyin ve öğrenci atamalarını yapın
          </p>
        </div>
        <Link
          href="/admin/siniflar/yeni"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          + Yeni Sınıf
        </Link>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sezon:</label>
            <select
              value={seasonFilter}
              onChange={(e) => setSeasonFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tümü</option>
              {seasons.map(season => (
                <option key={season} value={season}>{season}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Durum:</label>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tümü</option>
              <option value="active">Aktif</option>
              <option value="passive">Pasif</option>
            </select>
          </div>

          {(seasonFilter !== 'all' || activeFilter !== 'all') && (
            <button
              onClick={() => {
                setSeasonFilter('all')
                setActiveFilter('all')
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              ✕ Filtreleri Temizle
            </button>
          )}

          <div className="ml-auto text-sm text-gray-600">
            {filteredClasses.length} sınıf gösteriliyor
          </div>
        </div>
      </div>

      {/* Sınıf Listesi */}
      {filteredClasses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {classes.length === 0 ? 'Henüz sınıf oluşturulmamış' : 'Filtreye uygun sınıf bulunamadı'}
          </h3>
          <p className="text-gray-600 mb-6">
            {classes.length === 0 
              ? 'İlk sınıfınızı oluşturarak başlayın'
              : 'Farklı filtre seçeneklerini deneyin'}
          </p>
          {classes.length === 0 && (
            <Link
              href="/admin/siniflar/yeni"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              + Yeni Sınıf Oluştur
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{cls.name}</h3>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {cls.grade}. Sınıf
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {cls.season}
                    </span>
                    {cls.is_active ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        ✅ Aktif
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        ❌ Pasif
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600 mt-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">👥 Öğrenci:</span>
                      <span className={cls.studentCount >= cls.max_students ? 'text-red-600 font-bold' : ''}>
                        {cls.studentCount}/{cls.max_students}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">📚 Ders:</span>
                      <span>{cls.scheduleCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">⏰ Haftalık:</span>
                      <span>{cls.totalHours} saat</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Link
                    href={`/admin/siniflar/${cls.id}`}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium text-center"
                  >
                    ✏️ Düzenle
                  </Link>
                  <Link
                    href={`/admin/siniflar/${cls.id}/ogrenciler`}
                    className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium text-center"
                  >
                    👥 Öğrenciler
                  </Link>
                  <Link
                    href={`/admin/siniflar/${cls.id}/program`}
                    className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium text-center"
                  >
                    📅 Program
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer İstatistikler - Kompakt Şerit */}
      <div className="mt-8 bg-linear-to-r from-blue-50 to-purple-50 rounded-lg shadow p-4">
        <div className="flex items-center justify-around text-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <div>
              <p className="text-xs text-gray-600">Toplam Sınıf</p>
              <p className="text-lg font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>

          <div className="w-px h-10 bg-gray-300"></div>

          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-xs text-gray-600">Aktif Sınıf</p>
              <p className="text-lg font-bold text-green-600">{stats.active}</p>
            </div>
          </div>

          <div className="w-px h-10 bg-gray-300"></div>

          <div className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <div>
              <p className="text-xs text-gray-600">Toplam Öğrenci</p>
              <p className="text-lg font-bold text-purple-600">{stats.totalStudents}</p>
            </div>
          </div>

          <div className="w-px h-10 bg-gray-300"></div>

          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <div>
              <p className="text-xs text-gray-600">Sezon Sayısı</p>
              <p className="text-lg font-bold text-orange-600">{stats.seasonCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}