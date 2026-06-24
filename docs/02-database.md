# Database Schema (Supabase)

## Core Tables
| Table                | Purpose                                      | Key Columns                                                              |
|----------------------|----------------------------------------------|--------------------------------------------------------------------------|
| `profiles`           | User accounts (extends auth.users)           | id, role, display_name, avatar_url, verification_status, onboarding_completed, hourly_rate, subject_specialties, specializations, superpowers, subject_proficiency, video_intro_url, video_thumbnail_url, timezone, instant_bookings, buffer_minutes, first_session_free, free_discovery_call |
| `diagnostic_results` | Quiz results                                 | id, user_id, subject, goal, score, level, xp_earned, wrong_topics        |
| `roadmaps`           | Learning roadmaps                            | id, user_id, diagnostic_id, subject, goal, current_stage, total_stages   |
| `roadmap_stages`     | Individual stages                            | id, roadmap_id, stage_number, title, skills, status (locked/active/complete), completed_at |
| `sessions`           | Bookings                                     | id, student_id, tutor_id, scheduled_start, scheduled_end, duration_minutes, status_v2, payment_status, amount, meeting_url, notes, rating, cancellation_reason |
| `tutor_availability` | Weekly slots                                 | id, user_id, day_of_week, start_hour, end_hour, is_blocked              |
| `courses`            | Tutor courses                                | id, tutor_id, title, subtitle, category, difficulty, language, description, learning_outcomes, prerequisites, target_audience, estimated_weeks, price, currency, discount_price, status (draft/published/under_review/archived), slug, thumbnail_url |
| `course_sections`    | Sections within a course                     | id, course_id, title, position                                          |
| `course_lessons`     | Lessons within a section                     | id, section_id, course_id, title, description, video_url, duration_minutes, is_free_preview, position, resources (jsonb) |
| `reviews`            | Tutor reviews                                | id, tutor_id, student_id, rating, body                                 |
| `notifications`      | In‑app notifications                         | id, user_id, title, message, read, link, created_at                     |
| `message_threads`    | Chat threads                                 | id, tutor_id, student_id, tutor_response_minutes                        |
| `messages`           | (planned)                                    | id, thread_id, sender_id, body, created_at                              |
| `tutor_earnings`     | Payment ledger                               | id, tutor_id, session_id, amount, status, payout_date                  |
| `tutor_packages`     | Discount bundles                             | id, tutor_id, sessions, discount_percent, enabled                      |
| `verification_requests`| ID verification                           | id, user_id, status, documents                                         |
| `subjects`           | Subject catalog                              | id, name, category                                                      |

## Enums
- `session_status`: scheduled, confirmed, reminder_sent, in_progress, completed, awaiting_review, closed, cancelled, disputed
- `session_payment_status`: unpaid, pending, paid, refunded, failed
- `profiles.role`: student, tutor, both, admin

## Key Functions
- `book_session()` – atomic booking with conflict detection.
- `handle_new_user()` – auto‑creates profile on auth signup (trigger).
- `courses_set_slug()` – auto‑generates course slug.

## RLS Policies (summary)
- Profiles: anyone can view; users update own.
- Diagnostic results, roadmaps, notifications: user owns.
- Sessions: participants can view/update; students insert.
- Courses: public read published; tutors manage own.
- Reviews: public read; students insert.
- Message threads/messages: participants only.
- Admin access: based on `auth.jwt() ->> 'role' = 'admin'` (JWT claim).
- Availability: tutors manage own.