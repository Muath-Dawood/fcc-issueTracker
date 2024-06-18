'use strict';
const Issue = require('../models/Issue')
module.exports = function (app) {

  app.route('/api/issues/:project')
    .post(async function (req, res){
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      const project = req.params.project;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      try {
        const newIssue = new Issue({
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to || '',
          status_text: status_text || '',
          project
        });

        const savedIssue = await newIssue.save();
        res.json(savedIssue);
      } catch (error) {
        res.json({ error: 'could not create issue' });
      }      
    })
    
    .get(async function (req, res){
      const project = req.params.project;
      const filter = { project, ...req.query };

      try {
        const issues = await Issue.find(filter).exec();
        res.json(issues);
      } catch (error) {
        res.json({ error: 'could not retrieve issues' });
      }
    })
    
    .put(async function (req, res){
      const { _id, ...updateFields } = req.body;
      const project = req.params.project;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      if (Object.keys(updateFields).length === 0) {
        return res.json({ error: 'no update field(s) sent', '_id': _id });
      }

      updateFields.updated_on = new Date();

      try {
        const updatedIssue = await Issue.findByIdAndUpdate(_id, updateFields, { new: true }).exec();

        if (!updatedIssue) {
          return res.json({ error: 'could not update', '_id': _id });
        }

        res.json({ result: 'successfully updated', '_id': _id });
      } catch (error) {
        res.json({ error: 'could not update', '_id': _id });
      }
    })
    
    .delete(async function (req, res){
      const { _id } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      try {
        const deletedIssue = await Issue.findByIdAndDelete(_id).exec();

        if (!deletedIssue) {
          return res.json({ error: 'could not delete', '_id': _id });
        }

        res.json({ result: 'successfully deleted', '_id': _id });
      } catch (error) {
        res.json({ error: 'could not delete', '_id': _id });
      }
    });
    
};
