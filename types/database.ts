export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string;
          auth_user_id: string | null;
          email: string;
          full_name: string;
          role: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      companies: { Row: { id: string; name: string; type: string; anonymity_mode: string } };
      locations: {
        Row: {
          id: string;
          company_id: string;
          country: string;
          region: string;
          city: string;
          site_name: string;
          lat: number | null;
          lng: number | null;
        };
      };
      org_units: {
        Row: {
          id: string;
          company_id: string;
          parent_id: string | null;
          name: string;
          type: string;
          leader_employee_id: string | null;
        };
      };
      employees: {
        Row: {
          id: string;
          company_id: string;
          employee_code: string | null;
          first_name: string;
          last_name: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          status: string;
          hire_date: string | null;
          termination_date: string | null;
          birth_date: string | null;
          auth_user_id: string | null;
          app_role: string;
        };
      };
      employee_profiles: {
        Row: {
          id: string;
          employee_id: string;
          company_id: string;
          location_id: string | null;
          org_unit_id: string | null;
          manager_employee_id: string | null;
          gender: string | null;
          education_level: string | null;
          job_title: string | null;
          occupational_group: string | null;
          work_schedule: string | null;
          contract_type: string | null;
          company_type: string;
          age_band: string | null;
          tenure_band: string | null;
          shift_name: string | null;
          cost_center: string | null;
          team_name: string | null;
          project_name: string | null;
          is_leader: boolean;
          active: boolean;
        };
      };
      mood_checkins: {
        Row: {
          id: string;
          company_id: string;
          employee_id: string;
          location_id: string;
          org_unit_id: string;
          score: number;
          labels: string[] | null;
          note: string | null;
          anonymous: boolean;
          request_meeting: boolean;
          checked_at: string;
        };
      };
      surveys: {
        Row: {
          id: string;
          company_id: string;
          title: string;
          description: string | null;
          is_anonymous: boolean;
          active: boolean;
          start_date: string | null;
          end_date: string | null;
          target_scope: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      survey_questions: {
        Row: {
          id: string;
          survey_id: string;
          question_text: string;
          question_type: string;
          dimension: string | null;
          sort_order: number;
          required: boolean;
          options: Json | null;
          created_at: string;
          updated_at: string;
        };
      };
      survey_responses: {
        Row: {
          id: string;
          survey_id: string;
          question_id: string;
          company_id: string;
          employee_id: string | null;
          org_unit_id: string | null;
          location_id: string | null;
          response_text: string | null;
          response_numeric: number | null;
          response_json: Json | null;
          submitted_at: string;
          anonymity_mode: string;
          created_at: string;
          updated_at: string;
        };
      };
      survey_assignments: {
        Row: {
          id: string;
          survey_id: string;
          company_id: string;
          employee_id: string;
          status: string;
          scheduled_for: string;
          submitted_at: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      alert_rules: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          type: string;
          enabled: boolean;
          threshold: number;
          window_days: number;
        };
      };
      alerts: {
        Row: {
          id: string;
          company_id: string;
          location_id: string | null;
          org_unit_id: string | null;
          employee_id: string | null;
          type: string;
          status: string;
          title: string;
          detail: string | null;
          created_at: string;
        };
      };
      notification_logs: {
        Row: {
          id: string;
          alert_id: string;
          channel: string;
          status: string;
          sent_at: string | null;
        };
      };
    };
    Views: {
      vw_mood_checkins_enriched: { Row: Record<string, Json> };
      vw_org_pyramid: { Row: Record<string, Json> };
    };
  };
};

