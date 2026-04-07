import { personal } from '../../data';

export default function SiteTitle() {
  return (
    <div>
      <h1 className="font-bold text-white text-md">{personal.name}</h1>
      <p className="text-gray-5 text-sm">
        {personal.title} in {personal.city}
      </p>
    </div>
  );
}
