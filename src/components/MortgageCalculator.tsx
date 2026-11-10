import React, { useState, useEffect } from 'react';
import { formatSGD } from '../data/constants';
import { Calculator, Percent, Clock, DollarSign, ShieldAlert } from 'lucide-react';

interface MortgageCalculatorProps {
  initialPrice: number;
}

export const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({
  initialPrice,
}) => {
  const [price, setPrice] = useState<number>(initialPrice || 600000);
  const [loanType, setLoanType] = useState<'HDB' | 'BANK'>('HDB');
  const [interestRate, setInterestRate] = useState<number>(2.6); // default HDB concessionary rate
  const [tenureYears, setTenureYears] = useState<number>(25);
  const [downpaymentPct, setDownpaymentPct] = useState<number>(20); // 20% for HDB, 25% for bank

  useEffect(() => {
    if (initialPrice && initialPrice > 0) {
      setPrice(initialPrice);
    }
  }, [initialPrice]);

  const handleLoanTypeChange = (type: 'HDB' | 'BANK') => {
    setLoanType(type);
    if (type === 'HDB') {
      setInterestRate(2.6);
      setDownpaymentPct(20);
    } else {
      setInterestRate(3.0);
      setDownpaymentPct(25);
    }
  };

  // Computations
  const downpaymentAmount = Math.round(price * (downpaymentPct / 100));
  const loanAmount = Math.max(0, price - downpaymentAmount);
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = tenureYears * 12;

  let monthlyInstallment = 0;
  if (monthlyRate > 0 && totalMonths > 0 && loanAmount > 0) {
    monthlyInstallment = Math.round(
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
    );
  }

  const totalPayment = monthlyInstallment * totalMonths;
  const totalInterest = Math.max(0, totalPayment - loanAmount);

  // IRAS Singapore Buyer Stamp Duty (BSD) Progressive Calculation:
  // First $180,000 @ 1%
  // Next $180,000 ($180,001 - $360,000) @ 2%
  // Next $640,000 ($360,001 - $1,000,000) @ 3%
  // Next $500,000 ($1,000,001 - $1,500,000) @ 4%
  // Next above $1,500,000 @ 5%
  const calculateBSD = (p: number): number => {
    if (p <= 0) return 0;
    let bsd = 0;
    if (p <= 180000) {
      bsd = p * 0.01;
    } else if (p <= 360000) {
      bsd = 180000 * 0.01 + (p - 180000) * 0.02;
    } else if (p <= 1000000) {
      bsd = 180000 * 0.01 + 180000 * 0.02 + (p - 360000) * 0.03;
    } else if (p <= 1500000) {
      bsd =
        180000 * 0.01 +
        180000 * 0.02 +
        640000 * 0.03 +
        (p - 1000000) * 0.04;
    } else {
      bsd =
        180000 * 0.01 +
        180000 * 0.02 +
        640000 * 0.03 +
        500000 * 0.04 +
        (p - 1500000) * 0.05;
    }
    return Math.round(bsd);
  };

  const estimatedBsd = calculateBSD(price);

  return (
    <section id="calculator" className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-neutral-700" />
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
              HDB Mortgage & Affordability Estimator
            </h3>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Based on current mean filtered price ({formatSGD(initialPrice)}) or custom input
          </p>
        </div>

        {/* Loan Type Selector */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleLoanTypeChange('HDB')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              loanType === 'HDB'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            HDB Housing Loan (2.6%)
          </button>
          <button
            type="button"
            onClick={() => handleLoanTypeChange('BANK')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              loanType === 'BANK'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Bank Loan (3.0%)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5 items-start">
        {/* Input Parameters */}
        <div className="lg:col-span-7 space-y-4">
          {/* Purchase Price Input */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 mb-1.5">
              <span>Purchase Flat Price (SGD)</span>
              <button
                type="button"
                onClick={() => setPrice(initialPrice)}
                className="text-neutral-500 hover:text-neutral-900 underline decoration-dotted font-normal cursor-pointer"
              >
                Reset to Mean ({formatSGD(initialPrice)})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-sm">
                $
              </span>
              <input
                type="number"
                step="5000"
                value={price}
                onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
                className="w-full pl-8 pr-4 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-sm font-mono font-bold text-neutral-900 focus:bg-white focus:ring-2 focus:ring-neutral-900 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Sliders Grid: Downpayment, Tenure, Interest Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Downpayment % */}
            <div>
              <label className="font-semibold text-neutral-700 flex justify-between mb-1">
                <span>Downpayment</span>
                <span className="font-mono text-neutral-900">{downpaymentPct}%</span>
              </label>
              <input
                type="range"
                min="15"
                max="50"
                step="5"
                value={downpaymentPct}
                onChange={(e) => setDownpaymentPct(Number(e.target.value))}
                className="w-full accent-neutral-900 cursor-pointer"
              />
              <span className="text-[11px] text-neutral-500 font-mono mt-0.5 block">
                {formatSGD(downpaymentAmount)} (CPF / Cash)
              </span>
            </div>

            {/* Tenure Years */}
            <div>
              <label className="font-semibold text-neutral-700 flex justify-between mb-1">
                <span>Tenure</span>
                <span className="font-mono text-neutral-900">{tenureYears} yrs</span>
              </label>
              <input
                type="range"
                min="10"
                max="30"
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full accent-neutral-900 cursor-pointer"
              />
              <span className="text-[11px] text-neutral-500 font-mono mt-0.5 block">
                {totalMonths} monthly installments
              </span>
            </div>

            {/* Interest Rate */}
            <div>
              <label className="font-semibold text-neutral-700 flex justify-between mb-1">
                <span>Interest p.a.</span>
                <span className="font-mono text-neutral-900">{interestRate}%</span>
              </label>
              <input
                type="range"
                min="1.5"
                max="5.0"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-neutral-900 cursor-pointer"
              />
              <span className="text-[11px] text-neutral-500 font-mono mt-0.5 block">
                {loanType === 'HDB' ? 'CPF OA + 0.1%' : 'Fixed / SORA'}
              </span>
            </div>
          </div>
        </div>

        {/* Calculated Results Card */}
        <div className="lg:col-span-5 bg-neutral-900 text-white rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Estimated Monthly Installment
            </div>
            <div className="text-3xl font-bold font-mono text-rose-300">
              {formatSGD(monthlyInstallment)}
              <span className="text-xs text-neutral-400 font-sans font-normal ml-1">
                / month
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Payable via CPF Ordinary Account (OA) savings or cash.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Principal Loan:</span>
              <span className="font-mono text-white font-medium">{formatSGD(loanAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Total Interest:</span>
              <span className="font-mono text-neutral-300 font-medium">{formatSGD(totalInterest)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Buyer's Stamp Duty (IRAS BSD):</span>
              <span className="font-mono text-white font-semibold">{formatSGD(estimatedBsd)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
