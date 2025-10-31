import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Edit } from 'lucide-react';

const EditSkillsModal = ({ isOpen, onClose, onSave, initialTeach = [], initialLearn = [] }) => {
    const [skillsToTeach, setSkillsToTeach] = useState([]);
    const [skillsToLearn, setSkillsToLearn] = useState([]);
    const [newTeach, setNewTeach] = useState('');
    const [newLearn, setNewLearn] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSkillsToTeach(initialTeach || []);
            setSkillsToLearn(initialLearn || []);
        }
    }, [isOpen, initialTeach, initialLearn]);

    const addTeach = () => {
        const s = newTeach.trim();
        if (!s) return;
        if (!skillsToTeach.includes(s)) setSkillsToTeach([...skillsToTeach, s]);
        setNewTeach('');
    };

    const addLearn = () => {
        const s = newLearn.trim();
        if (!s) return;
        if (!skillsToLearn.includes(s)) setSkillsToLearn([...skillsToLearn, s]);
        setNewLearn('');
    };

    const removeTeach = (s) => setSkillsToTeach(skillsToTeach.filter(i => i !== s));
    const removeLearn = (s) => setSkillsToLearn(skillsToLearn.filter(i => i !== s));

    const handleSave = () => {
        onSave({ skillsToTeach, skillsToLearn });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5" /> Edit Skills
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="flex flex-col gap-6">
                        <div className="space-y-3">
                            <Label>Skills Offered</Label>
                            <div className="flex gap-2">
                                <Input value={newTeach} onChange={(e) => setNewTeach(e.target.value)} placeholder="Add a skill" />
                                <Button type="button" size="sm" onClick={addTeach}><Plus className="h-4 w-4" /></Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {skillsToTeach.map((s, idx) => (
                                    <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                                        {s}
                                        <button type="button" onClick={() => removeTeach(s)} className="hover:text-red-500">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                                {skillsToTeach.length === 0 && <p className="text-sm text-gray-500">No skills yet</p>}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>Skills Wanted</Label>
                            <div className="flex gap-2">
                                <Input value={newLearn} onChange={(e) => setNewLearn(e.target.value)} placeholder="Add a skill" />
                                <Button type="button" size="sm" onClick={addLearn}><Plus className="h-4 w-4" /></Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {skillsToLearn.map((s, idx) => (
                                    <Badge key={idx} variant="outline" className="flex items-center gap-1">
                                        {s}
                                        <button type="button" onClick={() => removeLearn(s)} className="hover:text-red-500">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                                {skillsToLearn.length === 0 && <p className="text-sm text-gray-500">No skills yet</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditSkillsModal;


