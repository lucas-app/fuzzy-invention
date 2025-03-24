-- Add additional policies for task submissions
CREATE POLICY "Users can update their own submissions"
  ON task_submissions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own submissions"
  ON task_submissions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);