const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server'); // Adjust the path as necessary
const should = chai.should();
const assert = chai.assert

chai.use(chaiHttp);

suite('Functional Tests', function() {
    let testId;
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Create an issue with every field', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            issue_text: 'Text',
            created_by: 'Tester',
            assigned_to: 'Chai and Mocha',
            status_text: 'In QA'
          })
          .end(function(err, res){
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('issue_title').eql('Title');
            res.body.should.have.property('issue_text').eql('Text');
            res.body.should.have.property('created_by').eql('Tester');
            res.body.should.have.property('assigned_to').eql('Chai and Mocha');
            res.body.should.have.property('status_text').eql('In QA');
            res.body.should.have.property('created_on');
            res.body.should.have.property('updated_on');
            res.body.should.have.property('open').eql(true);
            res.body.should.have.property('_id');
            testId = res.body._id; // Save for later tests
            assert.equal(res.body.issue_title, 'Title');
            done();
          });
      });
  
      test('Create an issue with only required fields', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            issue_text: 'Text',
            created_by: 'Tester'
          })
          .end(function(err, res){
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('issue_title').eql('Title');
            res.body.should.have.property('issue_text').eql('Text');
            res.body.should.have.property('created_by').eql('Tester');
            res.body.should.have.property('assigned_to').eql('');
            res.body.should.have.property('status_text').eql('');
            res.body.should.have.property('created_on');
            res.body.should.have.property('updated_on');
            res.body.should.have.property('open').eql(true);
            res.body.should.have.property('_id');
            assert.equal(res.body.created_by, 'Tester');
            done();
          });
      });
  
      test('Create an issue with missing required fields', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title'
          })
          .end(function(err, res){
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('error').eql('required field(s) missing');
            assert.equal(res.body.error, 'required field(s) missing');
            done();
          });
      });
  
    });
  
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
  
      test('View issues on a project', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .end(function(err, res){
            res.should.have.status(200);
            res.body.should.be.a('array');
            assert.isArray(res.body, 'response should be an array');
            assert.isAtLeast(res.body.length, 1, 'array should have at least 1 element');
            res.body[0].should.have.property('issue_title');
            res.body[0].should.have.property('issue_text');
            res.body[0].should.have.property('created_by');
            res.body[0].should.have.property('assigned_to');
            res.body[0].should.have.property('status_text');
            res.body[0].should.have.property('created_on');
            res.body[0].should.have.property('updated_on');
            res.body[0].should.have.property('open');
            res.body[0].should.have.property('_id');
            done();
          });
      });
  
      test('View issues on a project with one filter', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .query({ open: true })
          .end(function(err, res){
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.every(issue => issue.open).should.be.true;
            assert.isTrue(res.body.every(issue => issue.open), 'all issues should be open');
            done();
          });
      });
  
      test('View issues on a project with multiple filters', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .query({ open: true, created_by: 'Tester' })
          .end(function(err, res){
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.every(issue => issue.open && issue.created_by === 'Tester').should.be.true;
            assert.isTrue(res.body.every(issue => issue.open && issue.created_by === 'Tester'), 'all issues should be open and created by Tester');
            done();
          });
      });
  
    });
  
    suite('PUT /api/issues/{project} => text', function() {
  
      test('Update one field on an issue', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({
            _id: testId,
            issue_title: 'Updated Title'
          })
          .end(function(err, res){
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('result').eql('successfully updated');
            res.body.should.have.property('_id').eql(testId);
            assert.equal(res.body.result, 'successfully updated');
            done();
          });
      });
  
      test('Update multiple fields on an issue', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({
            _id: testId,
            issue_title: 'Updated Title',
            issue_text: 'Updated Text'
          })
          .end(function(err, res){
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('result').eql('successfully updated');
            res.body.should.have.property('_id').eql(testId);
            assert.equal(res.body.result, 'successfully updated');
            done();
          });
      });
  
      test('Update an issue with missing _id', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({
            issue_title: 'Updated Title'
          })
          .end(function(err, res){
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('error').eql('missing _id');
            assert.equal(res.body.error, 'missing _id');
            done();
          });
      });
  
      test('Update an issue with no fields to update', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({
            _id: testId
          })
          .end(function(err, res){
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('error').eql('no update field(s) sent');
            res.body.should.have.property('_id').eql(testId);
            assert.equal(res.body.error, 'no update field(s) sent');
            done();
          });
      });
  
      test('Update an issue with an invalid _id', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({
            _id: 'invalid_id',
            issue_title: 'Updated Title'
          })
          .end(function(err, res){
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('error').eql('could not update');
            res.body.should.have.property('_id').eql('invalid_id');
            assert.equal(res.body.error, 'could not update');
            done();
          });
      });
  
    });
  
    suite('DELETE /api/issues/{project} => text', function() {
  
      test('Delete an issue', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({
            _id: testId
          })
          .end(function(err, res){
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('result').eql('successfully deleted');
            res.body.should.have.property('_id').eql(testId);
            assert.equal(res.body.result, 'successfully deleted');
            done();
          });
      });
  
      test('Delete an issue with an invalid _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({
            _id: 'invalid_id'
          })
          .end(function(err, res){
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('error').eql('could not delete');
            res.body.should.have.property('_id').eql('invalid_id');
            assert.equal(res.body.error, 'could not delete');
            done();
          });
      });
  
      test('Delete an issue with missing _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({})
          .end(function(err, res){
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('error').eql('missing _id');
            assert.equal(res.body.error, 'missing _id');
            done();
          });
      });
  
    });
  
  });