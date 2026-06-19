export type Database = {
  readonly public: {
    readonly Tables: {
      readonly bazocon_sessions: {
        readonly Row: {
          readonly id: string
          readonly slug: string
          readonly title: string
          readonly speaker: string | null
          readonly starts_at: string
          readonly ends_at: string | null
          readonly kind: string
          readonly sort_order: number
          readonly is_public_qna_enabled: boolean
          readonly created_at: string
        }
      }
      readonly bazocon_questions: {
        readonly Row: {
          readonly id: string
          readonly session_id: string
          readonly body: string
          readonly nickname: string
          readonly status: string
          readonly is_pinned: boolean
          readonly created_at: string
          readonly updated_at: string
        }
      }
      readonly bazocon_question_votes: {
        readonly Row: {
          readonly question_id: string
          readonly visitor_id_hash: string
          readonly created_at: string
        }
      }
      readonly bazocon_event_state: {
        readonly Row: {
          readonly id: boolean
          readonly current_session_id: string | null
          readonly notice: string | null
          readonly updated_at: string
        }
      }
      readonly bazocon_admin_actions: {
        readonly Row: {
          readonly id: string
          readonly question_id: string | null
          readonly action: string
          readonly before_state: Record<string, unknown> | null
          readonly after_state: Record<string, unknown> | null
          readonly created_at: string
        }
      }
    }
  }
}
