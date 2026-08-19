import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AccountsListPage } from '@/features/accounts/AccountsListPage'
import { ChangePasswordPage } from '@/features/auth/ChangePasswordPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { ChatPage } from '@/features/conversations/ChatPage'
import { DocumentDetailPage } from '@/features/documents/DocumentDetailPage'
import { DocumentsListPage } from '@/features/documents/DocumentsListPage'
import { ProtectedRoute } from '@/shared/auth/ProtectedRoute'
import { RequirePasswordCurrent } from '@/shared/auth/RequirePasswordCurrent'
import { RequireRole } from '@/shared/auth/RequireRole'
import { AppShell } from '@/shared/layout/AppShell'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RequirePasswordCurrent />,
        children: [
          {
            path: '/change-password',
            element: <ChangePasswordPage />,
          },
          {
            element: <AppShell />,
            children: [
              {
                index: true,
                element: <Navigate to="/chat" replace />,
              },
              {
                path: '/chat',
                element: <ChatPage />,
              },
              {
                path: '/chat/:id',
                element: <ChatPage />,
              },
              {
                path: '/materiais',
                element: <DocumentsListPage />,
              },
              {
                element: <RequireRole roles={['cs_admin', 'cs_coordinator']} />,
                children: [
                  {
                    path: '/materiais/:id',
                    element: <DocumentDetailPage />,
                  },
                ],
              },
              {
                element: <RequireRole roles={['cs_admin']} />,
                children: [
                  {
                    path: '/contas',
                    element: <AccountsListPage />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
])
