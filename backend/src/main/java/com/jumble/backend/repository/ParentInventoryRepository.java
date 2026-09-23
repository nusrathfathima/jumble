package com.jumble.backend.repository;

import com.jumble.backend.model.ParentInventory;
import com.jumble.backend.model.ParentInventoryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ParentInventoryRepository extends JpaRepository<ParentInventory, ParentInventoryId> {

    @Query("select pi from ParentInventory pi where pi.parent.id = :parentId")
    List<ParentInventory> findByParentId(Long parentId);

    // Used by InventoryController's PUT to clear out the old set before
    // inserting the new one — see the comment there for why "replace
    // wholesale" is the simpler and safer contract for this endpoint.
    @Modifying
    @Query("delete from ParentInventory pi where pi.parent.id = :parentId")
    void deleteByParentId(Long parentId);
}
