import { Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Document } from '@/api/types/documents'
import { formatDate } from '@/shared/lib/formatDate'
import { DocumentStatusBadge } from './DocumentStatusBadge'

export function DocumentRow({ document, canManage }: { document: Document; canManage: boolean }) {
  return (
    <tr>
      <td className="px-4 py-3 align-middle font-medium text-neutral-900">
        {canManage ? (
          <Link to={`/materiais/${document.id}`} className="hover:underline">
            {document.title}
          </Link>
        ) : (
          document.title
        )}
      </td>
      <td className="px-4 py-3 align-middle text-neutral-600">{document.course.name}</td>
      <td className="px-4 py-3 align-middle">
        <DocumentStatusBadge status={document.status} />
      </td>
      <td className="px-4 py-3 align-middle text-neutral-600">{document.uploaded_by_name}</td>
      <td className="px-4 py-3 align-middle text-neutral-600">{formatDate(document.created_at)}</td>
      <td className="px-4 py-3 align-middle text-right">
        <a
          href={document.file}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-900"
        >
          <Download size={16} />
        </a>
      </td>
    </tr>
  )
}
