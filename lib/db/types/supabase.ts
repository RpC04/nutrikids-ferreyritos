export type Database = {
  public: {
    Tables: {
      recipes: {
        Row: {
          id: string
          title: string
          description: string
          ingredients: string
          preparation: string
          preparation_time_minutes: number | null
          servings: number | null
          notes: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          ingredients: string
          preparation: string
          preparation_time_minutes?: number | null
          servings?: number | null
          notes?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string
          ingredients?: string
          preparation?: string
          preparation_time_minutes?: number | null
          servings?: number | null
          notes?: string | null
          image_url?: string | null
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          title: string
          description: string
          date: string
          shift: string
          time: string
          location: string
          capacity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          date: string
          shift: string
          time: string
          location: string
          capacity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string
          date?: string
          shift?: string
          time?: string
          location?: string
          capacity?: number
          updated_at?: string
        }
      }
      event_settings: {
        Row: {
          id: string
          event_date: string | null
          start_date: string | null
          end_date: string | null
          display_date_label: string | null
          team_name: string | null
          team_size: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_date?: string | null
          start_date?: string | null
          end_date?: string | null
          display_date_label?: string | null
          team_name?: string | null
          team_size?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          event_date?: string | null
          start_date?: string | null
          end_date?: string | null
          display_date_label?: string | null
          team_name?: string | null
          team_size?: number | null
          updated_at?: string
        }
      }
      registrations: {
        Row: {
          id: string
          nombres: string
          apellidos: string
          dni: string
          edad: number
          sexo: string
          celular: string
          correo: string
          jornada: string
          diagnostico: string
          como_se_entero: string
          comentarios: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombres: string
          apellidos: string
          dni: string
          edad: number
          sexo: string
          celular: string
          correo: string
          jornada: string
          diagnostico: string
          como_se_entero: string
          comentarios?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          nombres?: string
          apellidos?: string
          dni?: string
          edad?: number
          sexo?: string
          celular?: string
          correo?: string
          jornada?: string
          diagnostico?: string
          como_se_entero?: string
          comentarios?: string | null
          updated_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          password_hash: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          password_hash?: string
          updated_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
