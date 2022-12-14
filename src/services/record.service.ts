import { GetRecordsTestDto, RecordDto } from 'dtos';
import { Record } from 'entities';
import { Service } from 'typedi';
import { CustomEntityManager, RecordRepository } from '../repositories';

@Service()
export class RecordService {
  constructor(@Service() private recordRepository: RecordRepository) {}
  async getByLike(params: GetRecordsTestDto) {
    const builder = this.recordRepository.createQueryBuilder();
    if (params.content) builder.where('content like :content', { content: `%${params.content}%` });
    if (params.name) builder.andWhere('name like :name', { name: `%${params.name}%` });
    return builder.getMany();
  }

  async deleteAndCreate(id: number, body: RecordDto) {
    await this.recordRepository.transaction(async (manager: CustomEntityManager<Record>) => {
      await manager.insert(Record, body);
      await manager.delete(Record, id);
    });
  }
}
