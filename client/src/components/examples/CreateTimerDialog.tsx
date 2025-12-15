import CreateTimerDialog from '../CreateTimerDialog';

export default function CreateTimerDialogExample() {
  return (
    <div className="p-4">
      <CreateTimerDialog onCreateTimer={(timer) => console.log('Created timer:', timer)} />
    </div>
  );
}
