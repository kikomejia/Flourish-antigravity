import React from 'react';

/**
 * TaskInstruction - Information bar providing user guidance and contextual tasks based on selected virtues.
 *
 * Auto-generated from captured website.
 * Key elements: instructional text
 * Styling: mt-auto, bottom padding, minimum height constraint
 */
const TaskInstruction = ({
  instructionText = ''
}) => {
  return (
    <>
      {/* TaskInstruction - Information bar providing user guidance and contextual tasks based on selected virtues. */}
      <div className="px-6 pb-8 mt-auto min-h-[160px] shrink-0"><div className="bg-slate-900/40 border rounded-2xl p-5 flex flex-col items-center justify-center gap-3 backdrop-blur-md min-h-[128px]" style={{borderColor: 'rgb(243, 175, 238)', boxShadow: 'rgba(243, 175, 238, 0.4) 0px 0px 30px 2px, rgba(243, 175, 238, 0.267) 0px 0px 15px 0px, rgba(243, 175, 238, 0.2) 0px 0px 15px 0px inset', opacity: '1'}}><p className="text-slate-200 text-sm font-medium text-center">Tap a virtue to view today's task</p></div></div>
    </>
  );
};

export default TaskInstruction;