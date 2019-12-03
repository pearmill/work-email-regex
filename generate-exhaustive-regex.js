#! node

/**
  Usage: ./generate-exhaustive-regex.js <domain-file>

  Output: Javascript compatible regular expression to validate against domains listed in domain-file
**/

const fs = require('fs');
const inputFile = fs.readFileSync(process.argv[2])
const domains = inputFile.toString().split(/\n|\r/);
const domainTld = {}
const domainGroups = []

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

// We group domains by their tld (not smart enough to catch .co.uk)
domains.forEach((domain) => {
  const parts = domain.split('.')
  const tld = parts.pop()

  // Special case for yoursubdomain: domain file uses that when the domain allows users their own subdomains
  const rawDomain = parts.join('\\.').replace('yoursubdomain', '[\\w-\\.]+')

  if (!domainTld[tld]) {
    domainTld[tld] = []
  }

  domainTld[tld].push(rawDomain)
})

Object.keys(domainTld).forEach((tld) => {
  const tldDomains = (domainTld[tld] || []).filter(onlyUnique).filter((d) => d && d.length);

  if (tldDomains.length > 0) {
    domainGroups.push(`((${tldDomains.join('|')})\\.${tld})`)
  }
})

const regex = `/^([\\w-\\.\\+]+@)(?!${domainGroups.join('|')})/i`

console.log(regex)
