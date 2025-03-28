const CalculatorResult = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="rounded-[12px] border bg-white/5 p-4">
      <div className="text-sm font-medium">Result</div>
      <div className="text-2xl font-semibold">{children}</div>
    </div>
  );
};

export default CalculatorResult;
