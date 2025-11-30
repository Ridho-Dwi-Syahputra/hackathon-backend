# Test Files - SAKO Backend

## 🧪 **Available Test Files**

### **1. Comprehensive Endpoint Analysis**
**File:** `test-endpoint-analyzer.js`
**Description:** Full analysis of all endpoints with detailed output
**Usage:**
```bash
node test/test-endpoint-analyzer.js
```

### **2. Quick Endpoint Check**  
**File:** `quick-endpoint-check.js`
**Description:** Quick summary of available endpoints
**Usage:**
```bash
node test/quick-endpoint-check.js
```

### **3. Generated Analysis Data**
**File:** `endpoint-analysis.json`
**Description:** JSON export of endpoint analysis data
**Content:** Structured data for integration with other tools

---

## 📊 **Test Results Summary**

- **Total Endpoints:** 29
- **Modules Tested:** 7 (Auth, Map, Video, Profile, Category, Badge, Quiz)
- **Map Module:** 7 new endpoints successfully detected
- **Route Mounting:** All modules properly mounted

---

## 🔄 **Running Tests**

From project root:
```bash
# Quick check
node test/quick-endpoint-check.js

# Full analysis  
node test/test-endpoint-analyzer.js

# View generated data
cat test/endpoint-analysis.json
```

All tests validate the endpoint analyzer utility and ensure all routes are properly detected and documented.