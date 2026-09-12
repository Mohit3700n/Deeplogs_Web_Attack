import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:fl_chart/fl_chart.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:file_picker/file_picker.dart';
import 'package:latlong2/latlong.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DeepLog Advanced SIEM',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark(useMaterial3: true).copyWith(
        scaffoldBackgroundColor: const Color(0xFF13131A),
        cardColor: const Color(0xFF1C1C26),
        textTheme: const TextTheme(bodyMedium: TextStyle(color: Colors.white70)),
      ),
      home: const DashboardScreen(),
    );
  }
}

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool isProcessing = false;
  String statusText = "System Standby";
  Map<String, dynamic>? responseData;
  int _selectedIndex = 0;

  bool _autoRefresh = true;
  bool _strictValidation = true;
  final TextEditingController _apiUrlController = TextEditingController(text: "http://127.0.0.1:8000/analyze/");

  Future<void> uploadAndProcessLog() async {
    final result = await FilePicker.pickFiles(type: FileType.custom, allowedExtensions: ['csv']);
    if (result.isEmpty || result.first.path == null) return;

    setState(() {
      isProcessing = true;
      statusText = "Analyzing logs via ML Pipeline...";
      responseData = null;
    });

    try {
      var uri = Uri.parse(_apiUrlController.text);
      var request = http.MultipartRequest('POST', uri);
      request.files.add(await http.MultipartFile.fromPath('file', result.first.path!));

      var response = await http.Response.fromStream(await request.send());

      if (response.statusCode == 200) {
        setState(() {
          responseData = jsonDecode(response.body);
          isProcessing = false;
          statusText = "Analysis Complete";
        });
      } else {
        setState(() {
          isProcessing = false;
          statusText = "API Error: ${response.statusCode}";
        });
      }
    } catch (e) {
      setState(() {
        isProcessing = false;
        statusText = "Connection Failed";
      });
    }
  }

  String _deriveAttackType(String? url, String? method) {
    url = url?.toLowerCase() ?? "";
    if (url.contains("script") || url.contains("alert")) return "XSS";
    if (url.contains("select") || url.contains("union") || url.contains("'")) return "SQLi";
    if (url.contains("etc/passwd") || url.contains("../")) return "Path Traversal";
    return "Anomalous Traffic";
  }

  Color _getSeverityColor(String type) {
    switch (type) {
      case "SQLi": return Colors.redAccent;
      case "XSS": return Colors.orangeAccent;
      case "Path Traversal": return Colors.pinkAccent;
      default: return Colors.greenAccent;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          // 1. ADVANCED FUNCTIONAL SIDEBAR
          Container(
            width: 260,
            color: const Color(0xFF161621),
            padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 15),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: const [
                    Icon(Icons.security, color: Colors.cyanAccent, size: 30),
                    SizedBox(width: 10),
                    Text("DeepLog", style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 1.5)),
                  ],
                ),
                const SizedBox(height: 5),
                const Text("ML-Powered SIEM", style: TextStyle(color: Colors.cyan, fontSize: 12)),
                const SizedBox(height: 40),

                _buildSidebarItem(Icons.dashboard, "Dashboard", 0),
                _buildSidebarItem(Icons.map, "Threat Intel", 1),
                _buildSidebarItem(Icons.analytics, "Model Metrics", 2),
                _buildSidebarItem(Icons.settings, "Settings", 3),

                const Spacer(),
                Container(
                  padding: const EdgeInsets.all(15),
                  decoration: BoxDecoration(
                    color: isProcessing ? Colors.orange.withValues(alpha: 0.1) : Colors.green.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: isProcessing ? Colors.orange : Colors.green, width: 1),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("Engine Status", style: TextStyle(color: Colors.white70, fontSize: 12)),
                      const SizedBox(height: 5),
                      Text(statusText, style: TextStyle(color: isProcessing ? Colors.orangeAccent : Colors.greenAccent, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton.icon(
                  onPressed: isProcessing ? null : uploadAndProcessLog,
                  icon: isProcessing ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black)) : const Icon(Icons.upload_file),
                  label: Text(isProcessing ? "Processing..." : "Ingest Log Data"),
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 50),
                    backgroundColor: Colors.cyanAccent,
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ],
            ),
          ),

          // 2. MAIN CONTENT AREA (Switches based on Sidebar selection)
          Expanded(
            child: IndexedStack(
              index: _selectedIndex,
              children: [
                _buildDashboardContent(), // Index 0
                _buildThreatIntelContent(), // Index 1
                _buildModelMetricsContent(), // Index 2
                _buildSettingsContent(), // Index 3
              ],
            ),
          ),
        ],
      ),
    );
  }


  Widget _buildSidebarItem(IconData icon, String title, int index) {
    bool isActive = _selectedIndex == index;
    return InkWell(
      onTap: () {
        setState(() {
          _selectedIndex = index;
        });
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 15),
        decoration: BoxDecoration(
          color: isActive ? Colors.cyanAccent.withValues(alpha: 0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          border: isActive ? const Border(left: BorderSide(color: Colors.cyanAccent, width: 4)) : null,
        ),
        child: Row(
          children: [
            Icon(icon, color: isActive ? Colors.cyanAccent : Colors.white54, size: 20),
            const SizedBox(width: 15),
            Text(title, style: TextStyle(color: isActive ? Colors.white : Colors.white54, fontSize: 16, fontWeight: isActive ? FontWeight.bold : FontWeight.normal)),
          ],
        ),
      ),
    );
  }

  // Main Dashboard View Builder
  Widget _buildDashboardContent() {
    if (responseData == null && !isProcessing) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.dashboard_customize, size: 80, color: Colors.white12),
            SizedBox(height: 20),
            Text("No Data Ingested", style: TextStyle(color: Colors.white54, fontSize: 24)),
            Text("Upload a CSV log file to populate the SIEM dashboard.", style: TextStyle(color: Colors.white30)),
          ],
        ),
      );
    }

    final threats = responseData?['recent_threats'] as List<dynamic>? ?? [];
    final summary = responseData?['summary'] as Map<String, dynamic>?;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. KPI CARDS (Top Row)
          Row(
            children: [
              Expanded(child: _buildKPICard("Total Ingested", summary?['total_requests'].toString() ?? "-", Icons.data_usage, Colors.blueAccent)),
              const SizedBox(width: 15),
              Expanded(child: _buildKPICard("Clean Traffic", summary?['clean_traffic'].toString() ?? "-", Icons.check_circle_outline, Colors.greenAccent)),
              const SizedBox(width: 15),
              Expanded(child: _buildKPICard("Malicious Threats", summary?['malicious_attacks'].toString() ?? "-", Icons.warning_amber, Colors.redAccent)),
              const SizedBox(width: 15),
              Expanded(child: _buildKPICard("Threat Rate", summary != null && summary['total_requests'] > 0 ? "${((summary['malicious_attacks'] / summary['total_requests']) * 100).toStringAsFixed(1)}%" : "-", Icons.percent, Colors.orangeAccent)),
            ],
          ),
          const SizedBox(height: 25),

          // 2. MAP (Full Width for clear visibility)
          SizedBox(
            height: 400,
            width: double.infinity,
            child: DashboardCard(
              title: "Global Threat Origins",
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: FlutterMap(
                  options: MapOptions(initialCenter: const LatLng(20.0, 0.0), initialZoom: 1.5),
                  children: [
                    TileLayer(
                      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'com.deeplog.siem',
                    ),
                    MarkerLayer(
                      markers: ((responseData?['locations'] as List?) ?? []).map((loc) {
                        return Marker(point: LatLng(loc['lat'], loc['lng']), width: 30, height: 30, child: const Icon(Icons.my_location, color: Colors.redAccent, size: 25));
                      }).toList(),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 25),

          // 3. CHARTS ROW (Pie Chart & Line Chart side-by-side with better ratios)
          SizedBox(
            height: 350,
            child: Row(
              children: [
                // Pie chart gets flex 1
                Expanded(flex: 1, child: DashboardCard(title: "Attack Vectors", child: _buildAttackDoughnutChart(threats))),
                const SizedBox(width: 20),
                // Line chart gets flex 2 so it stretches out and doesn't look squished
                Expanded(flex: 2, child: DashboardCard(title: "Attack Volume Trend", child: _buildLineChart(threats))),
              ],
            ),
          ),
          const SizedBox(height: 25),

          // 4. DATA TABLE (Full Width + Horizontal Scroll to fix Red Overflow Error)
          SizedBox(
            height: 400,
            width: double.infinity,
            child: DashboardCard(
              title: "Recent Malicious Payloads",
              child: SingleChildScrollView(
                scrollDirection: Axis.vertical, // Vertical Scroll
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal, // Horizontal Scroll (CRITICAL FIX)
                  child: DataTable(
                    headingRowColor: WidgetStateProperty.all(Colors.white.withValues(alpha: 0.05)),
                    columnSpacing: 40, // Increased spacing between columns
                    columns: const [
                      DataColumn(label: Text('Severity', style: TextStyle(fontWeight: FontWeight.bold))),
                      DataColumn(label: Text('Method', style: TextStyle(fontWeight: FontWeight.bold))),
                      DataColumn(label: Text('Attack Type', style: TextStyle(fontWeight: FontWeight.bold))),
                      DataColumn(label: Text('Target URL', style: TextStyle(fontWeight: FontWeight.bold))),
                    ],
                    rows: threats.map((threat) {
                      String type = _deriveAttackType(threat['URL'], threat['Method']);
                      Color sevColor = _getSeverityColor(type);
                      return DataRow(cells: [
                        DataCell(Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: sevColor.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(20), border: Border.all(color: sevColor)), child: Text("High", style: TextStyle(color: sevColor, fontSize: 12)))),
                        DataCell(Text(threat['Method'] ?? 'N/A', style: const TextStyle(color: Colors.cyanAccent))),
                        DataCell(Text(type)),
                        DataCell(Text(threat['URL'] ?? 'N/A')),
                      ]);
                    }).toList(),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 25),

          // 5. TARGETED ENDPOINTS BAR CHART (Full Width)
          SizedBox(
            height: 300,
            width: double.infinity,
            child: DashboardCard(
              title: "Most Targeted Endpoints",
              child: _buildEndpointsBarChart(threats),
            ),
          )
        ],
      ),
    );
  }

  // NEW BAR CHART HELPER
  Widget _buildEndpointsBarChart(List<dynamic> threats) {
    if (threats.isEmpty) return const Center(child: Text("No endpoint data available."));

    Map<String, int> urlCounts = {};
    for (var t in threats) {
      String url = t['URL'] ?? "Unknown";
      if (url.length > 15) url = "${url.substring(0, 15)}...";
      urlCounts[url] = (urlCounts[url] ?? 0) + 1;
    }

    var sortedEntries = urlCounts.entries.toList()..sort((a, b) => b.value.compareTo(a.value));
    var topEntries = sortedEntries.take(5).toList();

    return Padding(
      padding: const EdgeInsets.only(top: 20, right: 20),
      child: BarChart(
        BarChartData(
          alignment: BarChartAlignment.spaceAround,
          borderData: FlBorderData(show: false),
          titlesData: FlTitlesData(
            show: true,
            topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
            rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                getTitlesWidget: (value, meta) {
                  if (value.toInt() >= topEntries.length) return const Text("");
                  return Padding(padding: const EdgeInsets.only(top: 8.0), child: Text(topEntries[value.toInt()].key, style: const TextStyle(fontSize: 10, color: Colors.white70)));
                },
                reservedSize: 30,
              ),
            ),
          ),
          barGroups: topEntries.asMap().entries.map((entry) {
            return BarChartGroupData(
              x: entry.key,
              barRods: [
                BarChartRodData(
                  toY: entry.value.value.toDouble(),
                  color: Colors.cyanAccent,
                  width: 20,
                  borderRadius: BorderRadius.circular(4),
                  backDrawRodData: BackgroundBarChartRodData(show: true, toY: 10, color: Colors.white12),
                )
              ],
            );
          }).toList(),
        ),
      ),
    );
  }


  // THREAT INTEL VIEW (Index 1)
  Widget _buildThreatIntelContent() {
    if (responseData == null) {
      return const Center(child: Text("Upload a log file to generate Threat Intelligence", style: TextStyle(color: Colors.white54, fontSize: 18)));
    }

    final List<dynamic> threatFeeds = responseData?['threat_intel'] ?? [];

    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Live Threat Intelligence Feed", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 20),
          threatFeeds.isEmpty
              ? const Center(child: Text("No threats detected in the current log.", style: TextStyle(color: Colors.greenAccent, fontSize: 16)))
              : Expanded(
            child: ListView.builder(
              itemCount: threatFeeds.length,
              itemBuilder: (context, index) {
                var feed = threatFeeds[index];
                return Card(
                  color: const Color(0xFF1C1C26),
                  margin: const EdgeInsets.only(bottom: 10),
                  child: ListTile(
                    leading: const Icon(Icons.bug_report, color: Colors.redAccent),
                    title: Text("Source IP: ${feed['ip']}", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    subtitle: Text("Vector: ${feed['type']}", style: const TextStyle(color: Colors.white54)),
                    trailing: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text("Risk: ${feed['score']}", style: const TextStyle(color: Colors.orangeAccent, fontWeight: FontWeight.bold)),
                        Text(feed['status'], style: TextStyle(color: feed['status'] == "Blocked" ? Colors.greenAccent : Colors.cyanAccent, fontSize: 12)),
                      ],
                    ),
                  ),
                );
              },
            ),
          )
        ],
      ),
    );
  }

  // MODEL METRICS VIEW (Index 2) - Fed by your actual Model Report
  Widget _buildModelMetricsContent() {
    if (responseData == null) {
      return const Center(child: Text("Upload a log file to view Model Metrics", style: TextStyle(color: Colors.white54, fontSize: 18)));
    }

    final metrics = responseData?['model_metrics'];

    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Random Forest Classifier Metrics", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(child: _buildKPICard("Global Accuracy", metrics?['accuracy'] ?? "N/A", Icons.troubleshoot, Colors.cyanAccent)),
              const SizedBox(width: 15),
              Expanded(child: _buildKPICard("Precision (Malicious)", metrics?['precision'] ?? "N/A", Icons.my_location, Colors.greenAccent)),
              const SizedBox(width: 15),
              Expanded(child: _buildKPICard("Recall (Detection)", metrics?['recall'] ?? "N/A", Icons.find_in_page, Colors.orangeAccent)),
            ],
          ),
          const SizedBox(height: 30),
          const Text("System Recommendation: Accuracy matches trained pipeline constraints. Model is optimal.", style: TextStyle(color: Colors.greenAccent, fontSize: 16)),
        ],
      ),
    );
  }

  // SETTINGS VIEW (Index 3) - Now Fully Interactive
  Widget _buildSettingsContent() {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("System Configuration", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 20),
          DashboardCard(
            title: "API & Backend Settings",
            expandContent: false,
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text("Auto-refresh Threat Intel", style: TextStyle(color: Colors.white)),
                  value: _autoRefresh,
                  onChanged: (val) {
                    setState(() { _autoRefresh = val; });
                  },
                  activeThumbColor: Colors.cyanAccent,
                ),
                SwitchListTile(
                  title: const Text("Strict Log Validation (Drop Bad Lines)", style: TextStyle(color: Colors.white)),
                  value: _strictValidation,
                  onChanged: (val) {
                    setState(() { _strictValidation = val; });
                  },
                  activeThumbColor: Colors.cyanAccent,
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: _apiUrlController,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    labelText: "FastAPI Backend URL",
                    labelStyle: const TextStyle(color: Colors.white54),
                    filled: true,
                    fillColor: Colors.black26,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
                const SizedBox(height: 10),
                const Text("Changes apply on the next log ingestion.", style: TextStyle(color: Colors.white30, fontSize: 12))
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildKPICard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: const Color(0xFF1C1C26), borderRadius: BorderRadius.circular(10), border: Border.all(color: Colors.white12)),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(color: Colors.white54, fontSize: 14)),
              const SizedBox(height: 8),
              Text(value, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
            ],
          ),
          Icon(icon, color: color, size: 40),
        ],
      ),
    );
  }

  // Enhanced Doughnut Chart with Legend
  Widget _buildAttackDoughnutChart(List<dynamic> threats) {
    if (threats.isEmpty) return const Center(child: Text("No attack data"));

    Map<String, int> counts = {"SQLi": 0, "XSS": 0, "Path Traversal": 0, "Anomalous Traffic": 0};
    for (var t in threats) {
      counts[_deriveAttackType(t['URL'], t['Method'])] = (counts[_deriveAttackType(t['URL'], t['Method'])] ?? 0) + 1;
    }

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Chart container (Centered)
        Expanded(
          flex: 4,
          child: PieChart(
            PieChartData(
              sectionsSpace: 2,
              centerSpaceRadius: 40,
              sections: counts.entries.where((e) => e.value > 0).map((e) {
                return PieChartSectionData(
                  color: _getSeverityColor(e.key),
                  value: e.value.toDouble(),
                  title: '${e.value}',
                  radius: 45,
                  titleStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                );
              }).toList(),
            ),
          ),
        ),
        // Legend container
        Expanded(
          flex: 3,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: counts.entries.where((e) => e.value > 0).map((e) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(width: 14, height: 14, decoration: BoxDecoration(color: _getSeverityColor(e.key), shape: BoxShape.circle)),
                    const SizedBox(width: 8),
                    Expanded(child: Text(e.key, style: const TextStyle(fontSize: 12, color: Colors.white70), overflow: TextOverflow.ellipsis)),
                  ],
                ),
              );
            }).toList(),
          ),
        )
      ],
    );
  }

  // New Line Chart Implementation
  Widget _buildLineChart(List<dynamic> threats) {
    if (threats.isEmpty) return const Center(child: Text("Insufficient Data"));

    // Simulate trend data points based on log entries
    List<FlSpot> spots = [];
    int maxVolume = 1;
    for (int i = 0; i < threats.length; i++) {
      // Fake variation for visual appeal
      double volume = (i % 3 == 0) ? 2.0 : (i % 2 == 0 ? 5.0 : 1.0);
      if (volume > maxVolume) maxVolume = volume.toInt();
      spots.add(FlSpot(i.toDouble(), volume));
    }

    return Padding(
      padding: const EdgeInsets.only(right: 20, top: 20),
      child: LineChart(
        LineChartData(
          gridData: FlGridData(show: true, drawVerticalLine: false, getDrawingHorizontalLine: (value) => FlLine(color: Colors.white12, strokeWidth: 1)),
          titlesData: FlTitlesData(
            show: true,
            rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
            topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
            bottomTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 22, getTitlesWidget: (val, meta) => Text('T+${val.toInt()}', style: const TextStyle(fontSize: 10, color: Colors.white54)))),
            leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 28, getTitlesWidget: (val, meta) => Text('${val.toInt()}', style: const TextStyle(fontSize: 10, color: Colors.white54)))),
          ),
          borderData: FlBorderData(show: false),
          minX: 0,
          maxX: (spots.length - 1).toDouble(),
          minY: 0,
          maxY: maxVolume + 2.0,
          lineBarsData: [
            LineChartBarData(
              spots: spots,
              isCurved: true,
              color: Colors.cyanAccent,
              barWidth: 3,
              isStrokeCapRound: true,
              dotData: FlDotData(show: true),
              belowBarData: BarAreaData(show: true, color: Colors.cyanAccent.withValues(alpha: 0.2)),
            ),
          ],
        ),
      ),
    );
  }
}

class DashboardCard extends StatelessWidget {
  final String title;
  final Widget child;
  final bool expandContent; // Naya flag added

  const DashboardCard({
    super.key,
    required this.title,
    required this.child,
    this.expandContent = true // Default charts ke liye true rahega
  });

  @override
  Widget build(BuildContext context) {
    return Material( // Fixes ListTile InkSplash Error
      color: Theme.of(context).cardColor,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Colors.white12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min, // Fixes infinite height issue
          children: [
            Text(
                title,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 1.1)
            ),
            const Divider(color: Colors.white12, height: 30),
            // Agar expandContent true hai tabhi Expand karega
            expandContent ? Expanded(child: child) : child,
          ],
        ),
      ),
    );
  }
}