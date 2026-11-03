import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const AiInflationTicker = () => {
  const {
    user,
    macroFactors,
    secondsUntilNextInflation,
    inflationLogs,
    lastUpdatedTime,
    isRecalibrating,
    triggerInflationCycle
  } = useApp();

  const [showLogModal, setShowLogModal] = useState(false);

  // Format seconds mm:ss
  const minutes = Math.floor(secondsUntilNextInflation / 60);
  const seconds = secondsUntilNextInflation % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Progress percentage (120s down to 0s)
  const progressPercent = ((120 - secondsUntilNextInflation) / 120) * 100;

  return (
    <div className={`ai-inflation-bar ${isRecalibrating ? 'recalibrating-pulse' : ''}`}>
      <div className="inflation-bar-inner">
        {/* Left: Engine identity badge */}
        <div className="engine-identity">
          <span className="live-pulsing-dot"></span>
          <div className="engine-title-group">
            <div className="engine-badge-line">
              <span className="engine-chip">AI INFLATION MODEL</span>
              <span className="cadence-chip">2-Min Continuous Recalibration</span>
            </div>
            <h3 className="engine-headline">
              Autonomous Produce Price Inflation Engine
            </h3>
          </div>
        </div>

        {/* Middle: Macro Factors Live Telemetry */}
        <div className="macro-telemetry-grid">
          <div className="telemetry-pill">
            <span className="telemetry-label">CPI Index</span>
            <strong className={`telemetry-val ${macroFactors.cpiIndex > 105 ? 'warning' : ''}`}>
              {macroFactors.cpiIndex}
            </strong>
          </div>

          <div className="telemetry-pill">
            <span className="telemetry-label">Fuel Transport</span>
            <strong className="telemetry-val">₹{macroFactors.fuelIndex}/L</strong>
          </div>

          <div className="telemetry-pill">
            <span className="telemetry-label">Mandi Arrivals</span>
            <strong className="telemetry-val">
              {(macroFactors.mandiArrivalFactor * 100).toFixed(0)}%
            </strong>
          </div>

          <div className="telemetry-pill">
            <span className="telemetry-label">Inflation Trend</span>
            <span className={`trend-status-tag ${macroFactors.inflationTrend}`}>
              {macroFactors.inflationTrend === 'surge' ? '🔺 Surge (+)' : macroFactors.inflationTrend === 'cooling' ? '🔻 Cooling (-)' : '⚖️ Balanced'}
            </span>
          </div>
        </div>

        {/* Right: Live Countdown Clock & Faculty Demo Trigger */}
        <div className="countdown-action-container">
          <div className="countdown-clock-box">
            <div className="clock-label-row">
              <span className="clock-icon">⏱️</span>
              <span className="clock-title">Next AI Recalibration:</span>
              <span className="clock-countdown-digit">{timeFormatted}</span>
            </div>
            <div className="clock-progress-track">
              <div 
                className="clock-progress-fill" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="inflation-btn-group">
            {user?.role === 'admin' ? (
              <button 
                className="faculty-demo-btn"
                onClick={() => triggerInflationCycle(true)}
                disabled={isRecalibrating}
                title="Admin Control: Force recalculation of AI price inflation model"
              >
                {isRecalibrating ? '⚡ Computing AI Shift...' : '👑 Admin: Recalibrate Now'}
              </button>
            ) : (
              <span className="auto-cadence-badge" title="AI model automatically recalibrates produce prices every 2 minutes">
                🤖 Auto: 2-Min Interval
              </span>
            )}

            <button 
              className="history-logs-btn"
              onClick={() => setShowLogModal(true)}
              title="View AI Inflation model audit trail"
            >
              📜 Audit Trail
            </button>
          </div>
        </div>
      </div>

      {/* Floating Audit Trail Modal for Faculty Presentation */}
      {showLogModal && (
        <div className="modal-backdrop" onClick={() => setShowLogModal(false)}>
          <div className="modal-content audit-log-modal" onClick={e => e.stopPropagation()}>
            <div className="audit-modal-header">
              <div>
                <h3>🤖 AI Price Inflation Execution Audit Trail</h3>
                <p className="audit-subtitle">Live real-time logs generated every 2 minutes for faculty review</p>
              </div>
              <button className="close-modal" onClick={() => setShowLogModal(false)}>✕</button>
            </div>

            <div className="macro-summary-strip">
              <div><strong>Current CPI Index:</strong> {macroFactors.cpiIndex}</div>
              <div><strong>Fuel Cost Factor:</strong> {macroFactors.fuelIndex}</div>
              <div><strong>Mandi Supply Arrival Rate:</strong> {(macroFactors.mandiArrivalFactor * 100).toFixed(0)}%</div>
              <div><strong>Cycle Period:</strong> Every 120 seconds (2 Minutes)</div>
            </div>

            <div className="audit-logs-list">
              {inflationLogs.map(log => (
                <div key={log.id} className="audit-log-card">
                  <div className="log-top">
                    <span className="log-title">{log.title}</span>
                    <span className="log-time">🕒 {log.time}</span>
                  </div>
                  <p className="log-desc">{log.desc}</p>
                </div>
              ))}
            </div>

            <div className="audit-modal-actions">
              {user?.role === 'admin' && (
                <button 
                  className="faculty-demo-btn"
                  onClick={() => {
                    triggerInflationCycle(true);
                  }}
                >
                  ⚡ Admin: Trigger Immediate Recalibration
                </button>
              )}
              <button className="close-log-btn" onClick={() => setShowLogModal(false)}>
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiInflationTicker;
