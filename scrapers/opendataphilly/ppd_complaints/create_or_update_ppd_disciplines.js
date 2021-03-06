#!/usr/bin/env node

var config = require('../../config');
var readline = require('readline');
var neo4j = require('neo4j-driver').v1;

var driver = neo4j.driver(config.connect, neo4j.auth.basic(config.neoUser, config.neoPW));
var session = driver.session();

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

var stillReading = true;
var processingCount = 0;

rl.on('line', processLine);

rl.on('close', function() {
  stillReading = false;
});

function processLine(line) {
  processingCount++;
  var data = JSON.parse(line);
  session.run(
    'MATCH (p: PoliceComplaint:PoliceComplaintFinding {cartodb_id: {id}}) RETURN p',
    {id: data.cartodb_id}
  )
  .then(result => {
    if (!result.records.length) {
      console.log('Creating id:', data.cartodb_id);
      console.log("Data:", data);

      return session.run(
        'CREATE (p: PoliceComplaint:PoliceComplaintFinding {' +
        'cartodb_id: {cartodb_id}, ' +
        'the_geom: {the_geom}, ' +
        'the_geom_webmercator: {the_geom_webmercator}, ' +
        'cap_number: {cap_number}, ' +
        'po_initials: {po_initials}, ' +
        'po_race: {po_race}, ' +
        'po_sex: {po_sex}, ' +
        'allegations_investigated: {allegations_investigated}, ' +
        'investigative_findings: {investigative_findings}, ' +
        'disciplinary_findings: {disciplinary_findings} }' +
        ') RETURN p',
        data
      );
    }

    console.log('Updating id:', data.cartodb_id);
    console.log("Data:", data);

    return session.run(
      'MATCH (p: PoliceComplaint:PoliceComplaintFinding {cartodb_id: {cartodb_id}})\n' +
      'SET p.cartodb_id = {cartodb_id}, ' +
      'p.the_geom = {the_geom}, ' +
      'p.the_geom_webmercator = {the_geom_webmercator}, ' +
      'p.cap_number = {cap_number}, ' +
      'p.po_initials = {po_initials}, ' +
      'p.po_race = {po_race}, ' +
      'p.po_sex = {po_sex}, ' +
      'p.allegations_investigated = {allegations_investigated}, ' +
      'p.investigative_findings = {investigative_findings}, ' +
      'p.disciplinary_findings = {disciplinary_findings} ' +
      'RETURN p',
      data
    );
  })
  .then(() => {
    finishLine(line);
  })
  .catch((err) => {
    console.log("CRASHING:", err);
    session.close();
    driver.close();
  });
}

function finishLine(line) {
  --processingCount;

  if (!stillReading && !processingCount) {
    console.log("Done.");
    rl.close();
    session.close();
    driver.close();
  }
}
